import makeApiCall from './makeApiCall';
import { dbTransaction } from '../db';

export const exportSession = (body = {}, reqOpts = {}) => {
  const { script, uid, } = body;
  return makeApiCall.post(`/sessions?uid=${uid}&scriptId=${script.id}`, {
    body,
    ...reqOpts,
  });
};

export const countSessionsWithUidPrefix = (body = {}, reqOpts = {}) => {
  return makeApiCall.get('/sessions/count-by-uid-prefix', {
    body,
    ...reqOpts,
  });
};

export const getExportedSessionsByUID = uid => new Promise((resolve, reject) => {
  (async () => {
    if (!uid) return reject(new Error('UID is required'));

    try {
      const { sessions } = await makeApiCall.get('/find-sessions-by-uid', {
        body: { uid },
        parseResponse: res => res.json(),
      });
      return resolve(sessions);
    } catch (e) { /**/ }

    try {
      const sessions = await dbTransaction('select * from exports where uid=? order by ingested_at desc;', [uid]);
      resolve(sessions.map(s => ({ ...s, data: JSON.parse(s.data || '{}') })));
    } catch (e) { console.log(e); reject(e); }
  })();
});

export const getExportedSessions = () => new Promise((resolve, reject) => {
  (async () => {
    try {
      const [{ last_ingested_at }] = await dbTransaction('select max(ingested_at) as last_ingested_at from exports;');

      const rslts = await makeApiCall.get('/last-ingested-sessions', {
        body: { last_ingested_at }
      });
      const { error, sessions } = JSON.parse(rslts);

      if (error) return reject(error);

      await Promise.all(sessions.map(s => {
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
    } catch (e) { console.log('error', e); reject(e); }
  })();
});