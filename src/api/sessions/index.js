import { dbTransaction } from '../database/db';
import convertSessionsToExportable from './convertSessionsToExportable';
import exportSessions from './exportSessions';
import updateSession from './updateSession';
import saveSession from './saveSession';

export {
  convertSessionsToExportable,
  exportSessions,
  updateSession,
  saveSession
};

export const countSessions = (options = {}) => new Promise((resolve, reject) => {
  (async () => {
    try {
      const { ..._where } = options || {};
      const where = Object.keys(_where).map(key => `${key}=${JSON.stringify(_where[key])}`)
        .join(',');
      let q = 'select count(id) from sessions';
      q = where ? `${q} where ${where}` : q;

      const res = await dbTransaction(`${q};`.trim());
      resolve(res ? res[0] : 0);
    } catch (e) { reject(e); }
  })();
});

export const getSession = (options = {}) => new Promise((resolve, reject) => {
  (async () => {
    try {
      const { ..._where } = options || {};
      const where = Object.keys(_where).map(key => `${key}=${JSON.stringify(_where[key])}`)
        .join(',');
      let q = 'select * from sessions';
      q = where ? `${q} where ${where}` : q;

      const res = await dbTransaction(`${q} limit 1;`.trim());
      resolve(res.map(s => ({ ...s, data: JSON.parse(s.data || '{}') }))[0]);
    } catch (e) { reject(e); }
  })();
});

export const getSessions = (options = {}) => new Promise((resolve, reject) => {
  (async () => {
    try {
      const { _order, ..._where } = options || {};

      let order = (_order || [['createdAt', 'DESC']]);
      order = (order.map ? order : [])
        .map(keyVal => (!keyVal.map ? '' : `${keyVal[0] || ''} ${keyVal[1] || ''}`).trim())
        .filter(clause => clause)
        .join(',');

      const where = Object.keys(_where).map(key => `${key}=${JSON.stringify(_where[key])}`)
        .join(',');

      let q = 'select * from sessions';
      q = where ? `${q} where ${where}` : q;
      q = order ? `${q} order by ${order}` : q;

      const rows = await dbTransaction(`${q};`.trim(), null);
      resolve(rows.map(s => ({ ...s, data: JSON.parse(s.data || '{}') })));
    } catch (e) { reject(e); }
  })();
});

export const deleteSessions = (ids = []) => new Promise((resolve, reject) => {
  (async () => {
    try {
      ids = ids || [];
      if (!ids.map) ids = [ids];

      const res = await dbTransaction(`delete from sessions where id in (${ids.join(',')})`);
      resolve(res);
    } catch (e) { reject(e); }
  })();
});

