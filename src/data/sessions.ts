import { makeApiCall } from './api';
import { dbTransaction } from './db';
import { convertSessionsToExportable } from './convertSessionsToExportable';

export const exportSession = async (s: any) => {
    try {
        const res = await makeApiCall('nodeapi', `/sessions?uid=${s.uid}&scriptId=${s.script.id}&unique_key=${s.unique_key}`, {
            method: 'POST',
            body: JSON.stringify(s),
        });
        if (res.status !== 200) {
            const text = await res.text();
            console.log({
                status: res.status,
                error: text,
            });
            throw new Error('Failed to export session, try again!');
        }
        return true;
    } catch(e) {
        console.log('exportSession ERR', e);
        throw e;
    }
};

export const getExportedSessionsByUID = (uid: string) => new Promise<any []>((resolve, reject) => {
    (async () => {
        if (!uid) return reject(new Error('UID is required'));

        try {
			const localRes = await dbTransaction(`select * from sessions where uid='${uid}';`);

			const localSessions: any = await convertSessionsToExportable((localRes || []).filter(s => s.data).map(s => ({
				...s,
				data: JSON.parse(s.data),
			})));
            const res = await makeApiCall('nodeapi', `/find-sessions-by-uid?uid=${uid}`);
            const json = await res.json();
            resolve(Object.values({
				...localSessions
					.reduce((acc: any, s: any) => ({
						...acc,
						[s.unique_key]: { data: s },
					}), {}),
				...(json?.sessions || [])
					.reduce((acc: any, s: any) => ({
						...acc,
						[s.data.unique_key]: s,
					}), {})
			}));
        } catch (e) { /**/ }

        try {
            const sessions = await dbTransaction('select * from exports where uid=? order by ingested_at desc;', [uid]);
            resolve(sessions.map(s => ({ ...s, data: JSON.parse(s.data || '{}') })));
        } catch (e) {
            
             console.log(e); reject(e); }
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
             
            console.log('error', e); reject(e); }
    })();
});
