import { dbTransaction } from './database/db';
import { updateDeviceRegistration } from './webeditor';

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

export const updateSessions = (data = {}, opts = {}) => new Promise((resolve, reject) => {
  (async () => {
    try {
      const where = opts.where || {};
      data = { updatedAt: new Date().toISOString(), ...data };
      const _where = Object.keys(where).map(key => `${key}=${JSON.stringify(where[key])}`)
        .join(',');
      const set = Object.keys(data)
        .map(key => `${key}=?`)
        .join(',');
      const res = await dbTransaction(`update sessions set ${set} where ${_where || 1};`, Object.values(data));
      resolve(res);
    } catch (e) { reject(e); }
  })();
});

export const saveSession = (data = {}) => new Promise((resolve, reject) => {
  (async () => {
    const columns = [data.id ? 'id' : '', 'uid', 'script_id', 'data', 'completed', 'exported', 'createdAt', 'updatedAt']
      .filter(c => c)
      .join(',');

    const values = [data.id ? '?' : '', '?', '?', '?', '?', '?', '?', '?']
      .filter(c => c)
      .join(',');

    const params = [
      ...data.id ? [data.id] : [],
      data.uid,
      data.script_id,
      JSON.stringify(data.data || '{}'),
      data.completed || false,
      data.exported || false,
      data.createdAt || new Date().toISOString(),
      data.updatedAt || new Date().toISOString(),
    ];

    try {
      await dbTransaction(
        `insert or replace into sessions (${columns}) values (${values});`,
        params,
      );
    } catch (e) { return reject(e); }

    let application = null;
    try {
      application = await dbTransaction('select * from application where id=1;');
      application = application[0];

      const scripts_count = application.total_sessions_recorded + 1;
      const _application = {
        ...application,
        total_sessions_recorded: scripts_count,
      };

      await dbTransaction(
        `insert or replace into application (${Object.keys(_application).join(',')}) values (${Object.keys(_application).map(() => '?').join(',')});`,
        Object.values(_application)
      );

      application = await dbTransaction('select * from application where id=1;');
      application = application[0];
      if (application) application.webeditor_info = JSON.parse(application.webeditor_info || '{}');

      updateDeviceRegistration({ deviceId: application.device_id, details: { scripts_count } });
    } catch (e) { /* DO NOTHING */ }

    resolve({ application });
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

export const deleteSessions = (params = []) => new Promise((resolve, reject) => {
  (async () => {
    try {
      params = params || [];
      if (!params.map) params = [params];

      const res = await Promise.all(params.map(_where => {
        const where = Object.keys(_where).map(key => `${key}=${JSON.stringify(_where[key])}`)
          .join(',');
        let q = 'delete from sessions';
        q = where ? `${q} where ${where}` : q;

        return dbTransaction(`${q};`.trim());
      }));
      resolve(res);
    } catch (e) { reject(e); }
  })();
});

