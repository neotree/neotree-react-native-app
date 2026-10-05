import { makeApiCall, makeLocalGetApiCall } from './api';
import { dbTransaction } from './db';
import { convertSessionsToExportable } from './convertSessionsToExportable';
import { parseLastIngestedResponse } from './exportPlanning';
import { logError, logWarning } from '@/src/utils/logError';

export const getExportedSessionsByUID = (uid: string) => new Promise<any[]>((resolve, reject) => {
    (async () => {
        if (!uid) return reject(new Error('UID is required'));

        try {
            const localRes = await dbTransaction('select * from sessions where uid=?;', [uid]);
            const localSessions: any = await convertSessionsToExportable(
                (localRes || []).filter(s => s.data).map(s => ({
                    ...s,
                    data: JSON.parse(s.data),
                }))
            );

            let remoteSessions = [];
            let apiError = null;

            try {
                const res = await makeApiCall('nodeapi', `/find-sessions-by-uid?uid=${uid}`);
                const json = await res.json();

                // Check if the API returns an error format
                if (json?.[0]?.error || res.status >= 400) {
                    apiError = json?.[0]?.error || `API error ${res.status}`;
                } else {
                    remoteSessions = json?.sessions || [];
                }
            } catch (apiErr: any) {
                apiError = apiErr?.message || "API call failed";
            }

            if (apiError) {
                if (localSessions.length > 0) {
                    // Resolve with local sessions only
                    resolve(Object.values(
                        localSessions.reduce((acc: any, s: any) => ({
                            ...acc,
                            [s.unique_key]: { data: s },
                        }), {})
                    ));
                } else {
                    // No local data and API failed
                    resolve([{ error: apiError }]);
                }
            } else {
                // Merge local and remote sessions
                resolve(Object.values({
                    ...localSessions.reduce((acc: any, s: any) => ({
                        ...acc,
                        [s.unique_key]: { data: s },
                    }), {}),
                    ...remoteSessions.reduce((acc: any, s: any) => ({
                        ...acc,
                        [s.data.unique_key]: s,
                    }), {})
                }));
            }

        } catch (e: any) {
            resolve([{ error: e?.message }]);
        }
    })();
});

export const getLocalSessionsByUID = (
    uid: string,
    hospital: string,
    opts: { partial?: boolean } = {}
) => new Promise<any[]>((resolve, reject) => {
    (async () => {
        if (!uid) return reject(new Error('UID is required'));

        try {
            const { partial } = opts;
            const query = [
                `uid=${encodeURIComponent(uid)}`,
                `hospital=${encodeURIComponent(hospital)}`,
                partial ? 'partial=true' : null,
            ].filter(Boolean).join('&');
            const res = await makeLocalGetApiCall(`/localByUid?${query}`);

            // A null response means no local server is configured for this
            // hospital, which is not the same as the server holding no record.
            // Reported as an error so callers don't present it as "not found".
            if (res === null || res === undefined) {
                resolve([{ error: 'No local server is configured for this hospital.' }]);
                return;
            }

            const rows = Array.isArray(res)
                ? res
                : (Array.isArray(res?.sessions) ? res.sessions : null);
            if (!rows) {
                resolve([{ error: 'The local server returned an unexpected response.' }]);
                return;
            }

            // Deduplicate on unique_key, but keep rows that have none in their
            // own slot: partial records and older rows would otherwise all
            // collapse onto a single `undefined` key and only one would show.
            const byKey = new Map<string, any>();
            rows.forEach((s: any, index: number) => {
                const key = s?.data?.unique_key || s?.unique_key || `row:${index}`;
                byKey.set(`${key}`, s);
            });
            resolve(Array.from(byKey.values()));
        } catch (e: any) {
            resolve([{ error: e?.message }]);
        }
    })();
});

/**
 * Pulls in sessions other devices have exported since the last pull, so a
 * patient can be looked up here after being seen elsewhere. Triggered by the
 * nodeapi `sessions_exported` socket event.
 */
export const getExportedSessions = () => new Promise((resolve, reject) => {
    (async () => {
        try {
            const [{ last_ingested_at }] = await dbTransaction('select max(ingested_at) as last_ingested_at from exports;');

            const res = await makeApiCall(
                'nodeapi',
                `/last-ingested-sessions?last_ingested_at=${encodeURIComponent(`${last_ingested_at}`)}`,
            );
            // Read as text and parsed in one place: see parseLastIngestedResponse
            // for why this used to fail on every call.
            const parsed = parseLastIngestedResponse(await res.text());
            const error = parsed.error || (res.status >= 400 ? `HTTP ${res.status}` : null);
            if (error) {
                logWarning('getExportedSessions.rejected', 'Could not read sessions exported by other devices', {
                    status: res.status,
                    error,
                }, { source: 'nodeapi' });
                reject(new Error(error));
                return;
            }

            // One row per remote session: a repeated pull replaces the row
            // rather than storing the session again (see exports_session_id_idx).
            await Promise.all(parsed.sessions
                .filter((s: any) => s?.id !== undefined && s?.id !== null)
                .map((s: any) => dbTransaction(
                    `insert or replace into exports (session_id, uid, scriptid, ingested_at, data) values (?, ?, ?, ?, ?);`,
                    [s.id, s.uid, s.scriptid, s.ingested_at, JSON.stringify(s.data)],
                )));

            const [{ last_ingested_at: maxDate }] = await dbTransaction('select max(ingested_at) as last_ingested_at from exports;');
            if (maxDate) {
                const lastTwoWeeks = new Date(maxDate);
                lastTwoWeeks.setDate(lastTwoWeeks.getDate() - 14);
                await dbTransaction('delete from exports where ingested_at < ?;', [lastTwoWeeks.toISOString()]);
            }

            resolve(null);
        } catch (e) {
            logError('getExportedSessions', e);
            reject(e);
        }
    })();
});
