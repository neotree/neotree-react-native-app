import { InteractionManager } from 'react-native';

import { dbTransaction } from './db';
import { convertSessionsToExportable } from './convertSessionsToExportable';
import { makeApiCall, makeLocalApiCall, hasLocalServerConfig } from './api';
import { updateSession } from './updateSession';
import { withExportLock } from './exportLock';
import { getApplication, getLocation } from './queries';
import { isBackendDown, backendKey, NetworkUnavailableError } from './circuitBreaker';
import {
    getPollingCountries,
    isExportableSession,
    isPollDelivered,
    localRequiredForSession,
    POLL_TRACKING_STARTED_AT,
    pollingRequired,
} from './deliveryStatus';
import { exportAcknowledged, retryableHttpStatus } from './deliveryRules';

const afterInteractions = () => new Promise<void>(resolve => {
    InteractionManager.runAfterInteractions(() => resolve());
});

const EXPORT_CONCURRENCY = 3;
const EXPORT_BATCH_SIZE = 25;

type ExportDestination = 'main' | 'poll' | 'local';
export type ExportFailureKind = 'network' | 'http' | 'conversion' | 'configuration' | 'unknown';

export interface ExportFailure {
    id: any;
    destination: ExportDestination;
    kind: ExportFailureKind;
    message: string;
    retryable: boolean;
    status?: number;
}

export interface ExportBatchResult {
    failedMain: any[];
    failedPoll: any[];
    failedLocal: any[];
    okMain: any[];
    okPoll: any[];
    okLocal: any[];
    failures: ExportFailure[];
    localConfigured: boolean;
    remoteSkipped: boolean;
    localSkipped: boolean;
    hasMore: boolean;
}

const emptyResult = (): ExportBatchResult => ({
    failedMain: [], failedPoll: [], failedLocal: [],
    okMain: [], okPoll: [], okLocal: [], failures: [],
    localConfigured: false,
    remoteSkipped: false,
    localSkipped: false,
    hasMore: false,
});

async function runPooled<T>(
    items: T[],
    concurrency: number,
    stop: () => boolean,
    worker: (item: T) => Promise<void>,
): Promise<T[]> {
    let cursor = 0;
    const lanes = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
        while (cursor < items.length) {
            if (stop()) return;
            const item = items[cursor++];
            await worker(item);
        }
    });
    await Promise.allSettled(lanes);
    return items.slice(cursor);
}

function groupByCountry(sessions: any[]): Map<string, any[]> {
    const groups = new Map<string, any[]>();
    for (const session of sessions) {
        // Never route a malformed legacy row through the tablet's current
        // country: that could send clinical data to the wrong backend.
        const key = session.data?.country || 'unknown';
        const list = groups.get(key);
        if (list) list.push(session); else groups.set(key, [session]);
    }
    return groups;
}

function failureIds(result: ExportBatchResult, destination: ExportDestination): any[] {
    if (destination === 'main') return result.failedMain;
    if (destination === 'poll') return result.failedPoll;
    return result.failedLocal;
}

function successIds(result: ExportBatchResult, destination: ExportDestination): any[] {
    if (destination === 'main') return result.okMain;
    if (destination === 'poll') return result.okPoll;
    return result.okLocal;
}

function blockedField(destination: ExportDestination): string {
    if (destination === 'main') return 'main_export_blocked';
    if (destination === 'poll') return 'poll_export_blocked';
    return 'local_export_blocked';
}

function classifyError(error: any, kind?: ExportFailureKind): Pick<ExportFailure, 'kind' | 'message' | 'retryable'> {
    const message = error instanceof Error ? error.message : `${error || 'Unknown export error'}`;
    if (kind === 'conversion') return { kind, message, retryable: false };
    if (error instanceof NetworkUnavailableError
        || error?.name === 'AbortError'
        || /network request|timed out|unreachable|offline/i.test(message)) {
        return { kind: 'network', message, retryable: true };
    }
    if (/config|location not set|cannot read propert/i.test(message)) {
        return { kind: 'configuration', message, retryable: false };
    }
    return { kind: kind || 'unknown', message, retryable: true };
}

async function recordFailure(
    result: ExportBatchResult,
    session: any,
    destination: ExportDestination,
    error: any,
    opts: { kind?: ExportFailureKind; retryable?: boolean; status?: number } = {},
): Promise<void> {
    const classified = classifyError(error, opts.kind);
    const failure: ExportFailure = {
        id: session.id,
        destination,
        kind: classified.kind,
        message: classified.message,
        retryable: opts.retryable ?? classified.retryable,
        ...(opts.status === undefined ? {} : { status: opts.status }),
    };

    const ids = failureIds(result, destination);
    if (!ids.includes(session.id)) ids.push(session.id);
    if (!result.failures.some(existing => existing.id === session.id && existing.destination === destination)) {
        result.failures.push(failure);
    }

    // Permanent payload/configuration/4xx failures are quarantined so one bad
    // historical row cannot create an endless retry loop or starve newer rows.
    if (!failure.retryable) {
        try {
            await updateSession({
                [blockedField(destination)]: true,
                export_last_error: failure.message.slice(0, 500),
            }, { where: { id: session.id } });
        } catch (updateError) {
            console.error('Failed to persist export quarantine', updateError);
        }
    }
}

async function recordSuccess(
    result: ExportBatchResult,
    session: any,
    destination: ExportDestination,
): Promise<void> {
    const flag = destination === 'main'
        ? 'exported'
        : destination === 'poll' ? 'poll_exported' : 'local_export';
    await updateSession({
        [flag]: true,
        [blockedField(destination)]: false,
    }, { where: { id: session.id } });
    successIds(result, destination).push(session.id);
}

async function responseError(response: Response | null | undefined): Promise<string> {
    if (!response) return 'The server returned no response';
    let detail = '';
    try { detail = (await response.text()).trim().slice(0, 300); } catch { /* response body is optional */ }
    return `Server returned HTTP ${response.status}${detail ? `: ${detail}` : ''}`;
}

interface CohortContext {
    cohortCountry: string;
    cohortSessions: any[];
    hasLocalConfig: boolean;
    location: { country?: string | null; hospital?: string | null } | null | undefined;
    application: any;
    result: ExportBatchResult;
}

async function processCountryCohort(ctx: CohortContext): Promise<void> {
    const { cohortCountry, cohortSessions, hasLocalConfig, location, application, result } = ctx;
    const currentHospital = location?.hospital;
    const pollRequired = pollingRequired(cohortCountry);
    const localOwed = cohortSessions.filter(session => localRequiredForSession(session, location, hasLocalConfig));

    const remoteExportData = cohortSessions.filter(session => !session.exported && !session.main_export_blocked);
    const remotePollExportData = pollRequired
        ? cohortSessions.filter(session => !isPollDelivered(session) && !session.poll_export_blocked)
        : [];
    const localExportData = localOwed.filter(session => !session.local_export && !session.local_export_blocked);

    const remoteKey = backendKey(cohortCountry, 'nodeapi');
    const localKey = backendKey(cohortCountry, 'local', currentHospital);
    const remoteUp = !isBackendDown(remoteKey);
    const localUp = localExportData.length > 0 && !isBackendDown(localKey);

    if (!remoteUp && (remoteExportData.length || remotePollExportData.length)) {
        result.remoteSkipped = true;
        const error = new NetworkUnavailableError('nodeapi');
        await Promise.all([
            ...remoteExportData.map(session => recordFailure(result, session, 'main', error)),
            ...remotePollExportData.map(session => recordFailure(result, session, 'poll', error)),
        ]);
    }
    if (localExportData.length && !localUp) {
        result.localSkipped = true;
        const error = new NetworkUnavailableError('local');
        await Promise.all(localExportData.map(session => recordFailure(result, session, 'local', error)));
    }

    const standardCache = new Map<any, Promise<any>>();
    const confidentialCache = new Map<any, Promise<any>>();
    const convertOne = (session: any, confidential: boolean) => {
        const cache = confidential ? confidentialCache : standardCache;
        if (!cache.has(session.id)) {
            cache.set(session.id, convertSessionsToExportable([session], {
                showConfidential: confidential,
                application,
            }).then((rows: any) => rows[0]));
        }
        return cache.get(session.id)!;
    };

    const runDestination = async (
        sessions: any[],
        destination: ExportDestination,
        stop: () => boolean,
        send: (payload: any) => Promise<Response | null>,
        confidential: boolean,
    ) => {
        const deferred = await runPooled(sessions, EXPORT_CONCURRENCY, stop, async session => {
            let payload: any;
            try {
                payload = await convertOne(session, confidential);
            } catch (error) {
                await recordFailure(result, session, destination, error, { kind: 'conversion' });
                return;
            }

            try {
                const response = await send(payload);
                if (exportAcknowledged(response?.status)) {
                    await recordSuccess(result, session, destination);
                    return;
                }
                const status = response?.status || 0;
                await recordFailure(result, session, destination, new Error(await responseError(response)), {
                    kind: 'http',
                    status,
                    retryable: retryableHttpStatus(status),
                });
            } catch (error) {
                await recordFailure(result, session, destination, error);
            }
        });

        const unavailable = new NetworkUnavailableError(destination === 'local' ? 'local' : 'nodeapi');
        await Promise.all(deferred.map(session => recordFailure(result, session, destination, unavailable)));
    };

    const work: Promise<void>[] = [];
    if (remoteUp && remoteExportData.length) {
        work.push(runDestination(
            remoteExportData,
            'main',
            () => isBackendDown(remoteKey),
            payload => {
                const { id, exported, local_export, poll_exported, ...exportable } = payload;
                return makeApiCall('nodeapi', `/sessions?uid=${payload.uid}&scriptId=${payload.script.id}&unique_key=${payload.unique_key}`, {
                    method: 'POST',
                    body: JSON.stringify(exportable),
                }, { country: cohortCountry });
            },
            false,
        ));
    }
    if (remoteUp && remotePollExportData.length) {
        work.push(runDestination(
            remotePollExportData,
            'poll',
            () => isBackendDown(remoteKey),
            payload => {
                const { id, exported, local_export, poll_exported, ...exportable } = payload;
                return makeApiCall('nodeapi', `/save-poll-data?uid=${payload.uid}&scriptId=${payload.script.id}&unique_key=${payload.unique_key}`, {
                    method: 'POST',
                    body: JSON.stringify(exportable),
                }, { country: cohortCountry });
            },
            true,
        ));
    }
    if (localUp && localExportData.length) {
        work.push(runDestination(
            localExportData,
            'local',
            () => isBackendDown(localKey),
            payload => {
                const { id, exported, local_export, poll_exported, ...exportable } = payload;
                return makeLocalApiCall(`/local?uid=${payload.uid}&scriptId=${payload.script.id}&unique_key=${payload.unique_key}`, {
                    method: 'POST',
                    body: JSON.stringify(exportable),
                }, { country: cohortCountry, hospital: currentHospital ?? undefined });
            },
            true,
        ));
    }

    await Promise.allSettled(work);
}

function pendingSessionQuery(
    hasLocalConfig: boolean,
    currentCountry: string | null | undefined,
    currentHospital: string | null | undefined,
): { sql: string; params: any[] } {
    const pending: string[] = [
        `(exported IS NOT ? AND COALESCE(main_export_blocked, 0) = 0)`,
    ];
    const params: any[] = [true];
    const pollingCountries = getPollingCountries();

    if (pollingCountries.length) {
        pending.push(`(
            poll_exported IS NOT ?
            AND COALESCE(poll_export_blocked, 0) = 0
            AND COALESCE(createdAt, json_extract(data, '$.started_at')) >= ?
            AND json_extract(data, '$.country') IN (${pollingCountries.map(() => '?').join(',')})
        )`);
        params.push(true, POLL_TRACKING_STARTED_AT, ...pollingCountries);
    }

    if (hasLocalConfig && currentCountry && currentHospital) {
        pending.push(`(
            local_export IS NOT ?
            AND COALESCE(local_export_blocked, 0) = 0
            AND json_extract(data, '$.country') = ?
            AND TRIM(json_extract(data, '$.hospital_id')) = ?
        )`);
        params.push(true, currentCountry, currentHospital.trim());
    }

    params.push(EXPORT_BATCH_SIZE + 1);
    return {
        sql: `SELECT * FROM sessions
            WHERE json_valid(data)
            AND json_extract(data, '$.completed_at') IS NOT NULL
            AND json_extract(data, '$.canceled_at') IS NULL
            AND (${pending.join(' OR ')})
            ORDER BY createdAt ASC
            LIMIT ?;`,
        params,
    };
}

function needsDelivery(
    session: any,
    location: { country?: string | null; hospital?: string | null } | null | undefined,
    hasLocalConfig: boolean,
): boolean {
    return isExportableSession(session) && (
        !session.exported
        || !isPollDelivered(session)
        || (localRequiredForSession(session, location, hasLocalConfig) && !session.local_export)
    );
}

export async function doExportSessions(sessions?: any[]): Promise<ExportBatchResult> {
    const hasLocalConfig = await hasLocalServerConfig();
    const location = await getLocation();
    const currentCountry = location?.country;
    const currentHospital = location?.hospital;
    const result = emptyResult();
    result.localConfigured = hasLocalConfig;

    let candidates: any[];
    if (sessions) {
        // An explicit/manual export is also the user's retry mechanism for a
        // quarantined row, so it gets one fresh attempt regardless of blocks.
        candidates = sessions.filter(session => needsDelivery(session, location, hasLocalConfig));
    } else {
        const query = pendingSessionQuery(hasLocalConfig, currentCountry, currentHospital);
        const rows = await dbTransaction(query.sql, query.params);
        candidates = rows.map(session => ({ ...session, data: JSON.parse(session.data || '{}') }));
    }

    result.hasMore = candidates.length > EXPORT_BATCH_SIZE;
    let exportData = candidates.slice(0, EXPORT_BATCH_SIZE);
    if (!exportData.length) return result;

    if (sessions) {
        const blocked = exportData.filter(session => (
            session.main_export_blocked || session.poll_export_blocked || session.local_export_blocked
        ));
        await Promise.all(blocked.map(session => updateSession({
            main_export_blocked: false,
            poll_export_blocked: false,
            local_export_blocked: false,
            export_last_error: null,
        }, { where: { id: session.id } })));
        exportData = exportData.map(session => ({
            ...session,
            main_export_blocked: false,
            poll_export_blocked: false,
            local_export_blocked: false,
        }));
    }

    await afterInteractions();
    const application = await getApplication();
    const cohorts = groupByCountry(exportData);

    await Promise.all(Array.from(cohorts.entries()).map(async ([cohortCountry, cohortSessions]) => {
        try {
            await processCountryCohort({
                cohortCountry,
                cohortSessions,
                hasLocalConfig,
                location,
                application,
                result,
            });
        } catch (error) {
            await Promise.all(cohortSessions.map(async session => {
                if (!session.exported) await recordFailure(result, session, 'main', error);
                if (!isPollDelivered(session)) await recordFailure(result, session, 'poll', error);
                if (localRequiredForSession(session, location, hasLocalConfig) && !session.local_export) {
                    await recordFailure(result, session, 'local', error);
                }
            }));
        }
    }));

    return result;
}

export const exportSessions = (sessions?: any[]) => withExportLock(() => doExportSessions(sessions));

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
    if (retryTimer) return;
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
    if (debounceTimer || retryTimer) return;

    debounceTimer = setTimeout(() => {
        debounceTimer = null;
        exporting = true;
        let continueImmediately = false;

        exportSessions()
            .then(result => {
                const retryableFailure = result.failures.some(failure => failure.retryable);
                if (retryableFailure) {
                    scheduleRetry();
                } else {
                    clearRetry();
                    continueImmediately = result.hasMore;
                }
            })
            .catch(() => scheduleRetry())
            .finally(() => {
                exporting = false;
                if (continueImmediately || (pendingTrailing && !retryTimer)) {
                    pendingTrailing = false;
                    scheduleExportSessions();
                }
            });
    }, 1500);
}

/** Retry promptly after an observed connectivity recovery. */
export function resumeExportSessions() {
    clearRetry();
    scheduleExportSessions();
}
