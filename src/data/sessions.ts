import { makeApiCall, makeLocalGetApiCall } from './api';
import { dbTransaction } from './db';
import { convertSessionsToExportable } from './convertSessionsToExportable';
import { logError } from '@/src/utils/logError';

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

export const getExportedSessions = () => new Promise((resolve, reject) => {
    (async () => {
        try {
            const [{ last_ingested_at }] = await dbTransaction('select max(ingested_at) as last_ingested_at from exports;');

            const rslts = await makeApiCall('nodeapi', `/last-ingested-sessions?last_ingested_at=${last_ingested_at}`);
            const rsltsJSON = await rslts.json();
            const { error, sessions } = JSON.parse(rsltsJSON);

            if (error) return reject(error);

            await Promise.all(sessions.map((s: any) => {
                const data = {
                    session_id: s.id,
                    uid: s.uid,
                    scriptid: s.scriptid,
                    ingested_at: s.ingested_at,
                    data: JSON.stringify(s.data)
                };
                return dbTransaction(
                    `insert into exports (${Object.keys(data).join(',')}) values (${Object.keys(data).map(() => '?').join(',')})`,
                    Object.values(data)
                );
            }));

            const [{ last_ingested_at: maxDate }] = await dbTransaction('select max(ingested_at) as last_ingested_at from exports;');
            const lastTwoWeeks = new Date(maxDate);
            const pastDate = lastTwoWeeks.getDate() - 14;
            lastTwoWeeks.setDate(pastDate);

            await dbTransaction('delete from exports where ingested_at < ?;', [lastTwoWeeks.toISOString()]);

            resolve(null);
        } catch (e) {

            logError('pruneExports', e); reject(e);
        }
    })();
});
