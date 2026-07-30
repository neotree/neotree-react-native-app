import { InteractionManager } from 'react-native';

import { APP_CONFIG } from '@/src/constants';
import * as types from '../types';
import { dbTransaction } from './db';
import { convertSessionsToExportable } from './convertSessionsToExportable';
import { makeApiCall, makeLocalApiCall, hasLocalServerConfig } from './api';
import { updateSession } from './updateSession';
import { withExportLock } from './exportLock';
import { getLocation } from './queries';
import { isBackendDown, backendKey, onCircuitCooldownExpired } from './circuitBreaker';


export function pollingRequired(country: string): boolean {
    return (APP_CONFIG[country] as types.COUNTRY_CONFIG | undefined)?.savePollingData !== false;
}

export function isTerminalSession(session: any): boolean {
    return Boolean(session?.data?.completed_at || session?.data?.canceled_at);
}

/**
 * The hard export boundary: only successfully completed sessions may leave
 * the device. Canceled and interrupted sessions are deliberately excluded,
 * regardless of which caller supplied them or which delivery flag is pending.
 */
export function isExportableSession(session: any): boolean {
    return Boolean(session?.data?.completed_at && !session?.data?.canceled_at);
}

export function localRequiredForSession(
    session: any,
    location: { country?: string | null; hospital?: string | null } | null | undefined,
    hasLocalConfig: boolean,
): boolean {
    if (!hasLocalConfig) return false;
    if (!location?.country || !location?.hospital) return false;
    return session?.data?.country === location.country
        && session?.data?.hospital_id === location.hospital;
}

export function isFullyDelivered(
    session: any,
    location: { country?: string | null; hospital?: string | null } | null | undefined,
    hasLocalConfig: boolean,
): boolean {
    if (!session) return false;
    // Canceled sessions have no delivery obligation and can be deleted, but
    // they must never be sent or have export flags advanced.
    if (session?.data?.canceled_at && !isExportableSession(session)) return true;
    if (!isExportableSession(session)) return false;

    if (!session.exported) return false;
    if (pollingRequired(session?.data?.country) && !session.poll_exported) return false;
    if (localRequiredForSession(session, location, hasLocalConfig) && !session.local_export) return false;
    return true;
}


const afterInteractions = () => new Promise<void>(resolve => {
    InteractionManager.runAfterInteractions(() => resolve());
});

const EXPORT_CONCURRENCY = 5;

async function runPooled<T>(
    items: T[],
    concurrency: number,
    stop: () => boolean,
    worker: (item: T, index: number) => Promise<void>,
): Promise<T[]> {
    let cursor = 0;
    const lanes = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
        while (cursor < items.length) {
            if (stop()) return;
            const i = cursor++;
            await worker(items[i], i);
        }
    });
    await Promise.allSettled(lanes);
    return items.slice(cursor);
}

export interface ExportBatchResult {
    failedMain: any[];
    failedPoll: any[];
    failedLocal: any[];
    okMain: any[];
    okPoll: any[];
    okLocal: any[];
    localConfigured: boolean;
    remoteSkipped: boolean;
    localSkipped: boolean;
}

const emptyResult = (): ExportBatchResult => ({
    failedMain: [], failedPoll: [], failedLocal: [],
    okMain: [], okPoll: [], okLocal: [],
    localConfigured: false,
    remoteSkipped: false,
    localSkipped: false,
});


function groupByCountry(sessions: any[], fallbackCountry: string | undefined | null): Map<string, any[]> {
    const groups = new Map<string, any[]>();
    for (const s of sessions) {
        const key = s.data?.country || fallbackCountry || 'unknown';
        const list = groups.get(key);
        if (list) list.push(s); else groups.set(key, [s]);
    }
    return groups;
}

interface CohortContext {
    cohortCountry: string;
    cohortSessions: any[];
    hasLocalConfig: boolean;
    location: { country?: string | null; hospital?: string | null } | null | undefined;
    result: ExportBatchResult;
}

function markCohortPending(ctx: CohortContext, reason: string, e?: unknown): void {
    const { cohortCountry, cohortSessions, hasLocalConfig, location, result } = ctx;
    console.log('exportSessions cohort', reason, cohortCountry, e);
    cohortSessions.forEach(s => {
        if (!s.exported) result.failedMain.push(s.id);
        if (pollingRequired(cohortCountry) && !s.poll_exported) result.failedPoll.push(s.id);
        if (localRequiredForSession(s, location, hasLocalConfig) && !s.local_export) result.failedLocal.push(s.id);
    });
}

async function processCountryCohort(ctx: CohortContext): Promise<void> {
    const { cohortCountry, cohortSessions, hasLocalConfig, location, result } = ctx;
    const currentHospital = location?.hospital;

    const pollRequired = pollingRequired(cohortCountry);
    if (!pollRequired) {
        const neverNeedsPoll = cohortSessions.filter(s => !s.poll_exported);
        // A db failure here must not be swallowed — see markCohortPending.
        await Promise.all(neverNeedsPoll.map(s => updateSession({ poll_exported: true }, { where: { id: s.id } })));
    }

    const localOwed = cohortSessions.filter(s => localRequiredForSession(s, location, hasLocalConfig));
    const allowLocal = localOwed.length > 0;

    const remoteUp = !isBackendDown(backendKey(cohortCountry, 'nodeapi'));
    const localUp = allowLocal && !isBackendDown(backendKey(cohortCountry, 'local', currentHospital));

    if (!remoteUp) result.remoteSkipped = true;
    if (allowLocal && !localUp) result.localSkipped = true;

    if (!remoteUp && !localUp) return;

    const remoteExportData: any[] = remoteUp ? cohortSessions.filter(s => !s.exported) : [];
    const remotePollExportData: any[] = (remoteUp && pollRequired) ? cohortSessions.filter(s => !s.poll_exported) : [];

    const localExportData: any[] = localUp ? localOwed.filter(s => !s.local_export) : [];

    if (!remoteExportData.length && !remotePollExportData.length && !localExportData.length) return;

    let standardData: any[];
    let confidentialData: any[];
    try {
        standardData = remoteExportData.length ? await convertSessionsToExportable(remoteExportData) as any[] : [];
        const confidentialSource = Array.from(
            new Map([...remotePollExportData, ...localExportData].map(s => [s.id, s])).values()
        );
        confidentialData = confidentialSource.length
            ? await convertSessionsToExportable(confidentialSource, { showConfidential: true }) as any[]
            : [];
    } catch (e) {
        // Conversion failed before a single network call was attempted — every
        // session pending for any destination here is still pending.
        console.log('exportSessions cohort conversion', cohortCountry, e);
        remoteExportData.forEach(s => result.failedMain.push(s.id));
        remotePollExportData.forEach(s => result.failedPoll.push(s.id));
        localExportData.forEach(s => result.failedLocal.push(s.id));
        return;
    }

    const promises: Promise<any>[] = [];

    // --- Remote export: /sessions + /save-poll-data --------------------
    if (remoteUp) {
        const remoteDown = () => isBackendDown(backendKey(cohortCountry, 'nodeapi'));

        promises.push(runPooled(standardData, EXPORT_CONCURRENCY, remoteDown, async (s: any, i: number) => {
            try {
                const { id, exported, local_export, poll_exported, ...exportable } = s;
                const res = await makeApiCall('nodeapi', `/sessions?uid=${s.uid}&scriptId=${s.script.id}&unique_key=${s.unique_key}`, {
                    method: 'POST',
                    body: JSON.stringify(exportable),
                }, { country: cohortCountry });
                if (res?.status === 200) {
                    await updateSession({ exported: true }, { where: { id, }, });
                    result.okMain.push(id);
                } else {
                    result.failedMain.push(id);
                }
            } catch (e) {
                result.failedMain.push(remoteExportData[i].id);
                console.log(e);
            }
        }).then(deferred => { deferred.forEach((s: any) => result.failedMain.push(s.id)); }));

        const remotePollConfidentialData = confidentialData.filter((s: any) => !s.poll_exported);
        promises.push(runPooled(remotePollConfidentialData, EXPORT_CONCURRENCY, remoteDown, async (s: any) => {
            const { id, exported, local_export, poll_exported, ...exportable } = s;
            try {
                const res = await makeApiCall('nodeapi', `/save-poll-data?uid=${s.uid}&scriptId=${s.script.id}&unique_key=${s.unique_key}`, {
                    method: 'POST',
                    body: JSON.stringify(exportable),
                }, { country: cohortCountry });
                if (res?.status === 200) {
                    await updateSession({ poll_exported: true }, { where: { id, }, });
                    result.okPoll.push(id);
                } else {
                    result.failedPoll.push(id);
                }
            } catch (e) {
                result.failedPoll.push(id);
                console.log(e);
            }
        }).then(deferred => { deferred.forEach((s: any) => result.failedPoll.push(s.id)); }));
    }

    // --- Local export: /local ------------------------------------------
    if (localUp) {
        const localDown = () => isBackendDown(backendKey(cohortCountry, 'local', currentHospital));

        const localEligibleIds = new Set(localExportData.map((s: any) => s.id));
        const localConfidentialData = confidentialData.filter((s: any) => !s.local_export && localEligibleIds.has(s.id));
        promises.push(runPooled(localConfidentialData, EXPORT_CONCURRENCY, localDown, async (s: any) => {
            const { id, exported, local_export, poll_exported, ...exportable } = s;
            try {
                const res = await makeLocalApiCall(`/local?uid=${s.uid}&scriptId=${s.script.id}&unique_key=${s.unique_key}`, {
                    method: 'POST',
                    body: JSON.stringify(exportable),
                }, { country: cohortCountry, hospital: currentHospital ?? undefined });
                if (res?.status === 200) {
                    await updateSession({ local_export: true }, { where: { id, }, });
                    result.okLocal.push(id);
                } else {
                    result.failedLocal.push(id);
                }
            } catch (e) {
                result.failedLocal.push(id);
                console.log(e);
            }
        }).then(deferred => { deferred.forEach((s: any) => result.failedLocal.push(s.id)); }));
    }

    await Promise.allSettled(promises);
}

export const doExportSessions = (sessions?: any[]): Promise<ExportBatchResult> => new Promise((resolve, reject) => {
    (async () => {
        try {
            const hasLocalConfig = await hasLocalServerConfig();
            const location = await getLocation();
            const currentCountry = location?.country;
            const currentHospital = location?.hospital;

            let dbSessions = [];
            if (!sessions) dbSessions = await dbTransaction(
                hasLocalConfig
                    ? `SELECT * FROM sessions WHERE json_extract(data, '$.completed_at') IS NOT NULL AND json_extract(data, '$.canceled_at') IS NULL AND (exported IS NOT ? OR poll_exported IS NOT ? OR (local_export IS NOT ? AND json_extract(data, '$.country') = ? AND json_extract(data, '$.hospital_id') = ?));`
                    : `SELECT * FROM sessions WHERE json_extract(data, '$.completed_at') IS NOT NULL AND json_extract(data, '$.canceled_at') IS NULL AND (exported IS NOT ? OR poll_exported IS NOT ?);`,
                hasLocalConfig ? [true, true, true, currentCountry, currentHospital] : [true, true]
            );

            const exportableDbSessions = dbSessions
                .map(s => ({ ...s, data: JSON.parse(s.data || '{}'), }))
                .filter(isExportableSession);
           
            const suppliedSessions = sessions ? sessions.filter(isExportableSession) : null;
            const exportData: any[] = suppliedSessions || exportableDbSessions.filter(
                s => isExportableSession(s) && (
                    !s.exported ||
                    !s.poll_exported ||
                    (hasLocalConfig && !s.local_export && s.data?.country === currentCountry && s.data?.hospital_id === currentHospital)
                )
            );

            if (!exportData.length) {
                resolve({ ...emptyResult(), localConfigured: hasLocalConfig });
                return;
            }

            // Yield to the UI before the heavy work below.
            await afterInteractions();

            const result = emptyResult();
            result.localConfigured = hasLocalConfig;
            const cohorts = groupByCountry(exportData, currentCountry);

            await Promise.all(Array.from(cohorts.entries()).map(async ([cohortCountry, cohortSessions]) => {
                const ctx: CohortContext = {
                    cohortCountry,
                    cohortSessions,
                    hasLocalConfig,
                    location,
                    result,
                };
                try {
                    await processCountryCohort(ctx);
                } catch (e) {
                    markCohortPending(ctx, 'failed', e);
                }
            }));

            resolve(result);
        } catch (e) {
            reject(e);
        }
    })();
});

export const exportSessions = (sessions?: any[]) => withExportLock(() => doExportSessions(sessions));

onCircuitCooldownExpired(() => scheduleExportSessions());

// --- Debounced background export -----------------------------------------------
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let exporting = false;
let pendingTrailing = false;

const RETRY_BASE_MS = 15_000;
const RETRY_MAX_MS = 5 * 60_000;
const RETRY_JITTER_RATIO = 0.2;
let retryAttempt = 0;
let retryTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleRetry() {
    if (retryTimer) return; // one bounded timer at a time
    const raw = Math.min(RETRY_BASE_MS * (2 ** retryAttempt), RETRY_MAX_MS);
    const jitter = raw * RETRY_JITTER_RATIO * (Math.random() * 2 - 1);
    const delay = Math.max(RETRY_BASE_MS, Math.round(raw + jitter));
    retryAttempt += 1;
    retryTimer = setTimeout(() => {
        retryTimer = null;
        scheduleExportSessions();
    }, delay);
}

function clearRetry() {
    if (retryTimer) {
        clearTimeout(retryTimer);
        retryTimer = null;
    }
    retryAttempt = 0;
}


export function scheduleExportSessions() {
    if (exporting) {
        pendingTrailing = true;
        return;
    }
    if (debounceTimer) return;
    debounceTimer = setTimeout(() => {
        debounceTimer = null;
        exporting = true;
        exportSessions()
            .then(result => {
                const hasPending = result.failedMain.length || result.failedPoll.length || result.failedLocal.length;
                if (hasPending) scheduleRetry();
                else clearRetry();
            })
            .catch(() => {
                scheduleRetry();
            })
            .finally(() => {
                exporting = false;
                if (pendingTrailing) {
                    pendingTrailing = false;
                    scheduleExportSessions();
                }
            });
    }, 1500);
}
