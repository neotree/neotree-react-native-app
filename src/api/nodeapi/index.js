import makeApiCall from './makeApiCall';
import { dbTransaction } from '../database';

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

export const getExportedSessionByUID = uid => new Promise((resolve, reject) => {
  (async () => {
    if (!uid) return reject(new Error('UID is required'));
    try {
      const rows = await dbTransaction('select * from exports where uid=?;', [uid]);
      const session = rows[0] || null;
      resolve(!session ? null : { ...session, data: JSON.parse(session.data || '{}') });
    } catch (e) { console.log(e); reject(e); }
  })();
});

export const getExportedSessions = () => new Promise((resolve, reject) => {
  (async () => {
    try {
      const res = await dbTransaction('select max(ingested_at) as last_ingested_at from exports;');
      const { last_ingested_at } = res[0];

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

      resolve();
    } catch (e) { console.log('error', e); reject(e); }
  })();
});
