import { dbTransaction } from './db';
import { getScreens } from './_screens';
import { Script, ScriptRow, QueryFilter, ScriptFields } from './types';

export const getScript = (options = {}) => new Promise<Script>((resolve, reject) => {
  (async () => {
    try {
      const { ..._where } = options || {};
      const where = Object.keys(_where).map(key => `${key}=${JSON.stringify(_where[key])}`)
        .join(',');
      let q = 'select * from scripts';
      q = where ? `${q} where ${where}` : q;

      const res = await dbTransaction<ScriptRow>(`${q} limit 1;`.trim());
      resolve(res.map(s => ({ ...s, data: JSON.parse(s.data || '{}') }))[0]);
    } catch (e) { reject(e); }
  })();
});

export const getScripts = (options: QueryFilter = {}) => new Promise<Script[]>((resolve, reject) => {
  (async () => {
    try {
      const { order: _order, ..._where } = options || {};

      const orderValue = (_order || [['position', 'ASC']]);
      const order = (orderValue.map ? orderValue : [])
        .map(keyVal => (!keyVal.map ? '' : `${keyVal[0] || ''} ${keyVal[1] || ''}`).trim())
        .filter(clause => clause)
        .join(',');

      const where = Object.keys(_where).map(key => `${key}=${JSON.stringify(_where[key])}`)
        .join(',');

      let q = 'select * from scripts';
      q = where ? `${q} where ${where}` : q;
      q = order ? `${q} order by ${order}` : q;

      const rows = await dbTransaction<ScriptRow>(`${q};`.trim());
      resolve(rows.map(s => ({ ...s, data: JSON.parse(s.data || '{}') })));
    } catch (e) { reject(e); }
  })();
});

export const saveScripts = (data = []) => new Promise((resolve, reject) => {
  (async () => {
    try {
      data = data || [];
      if (!data.length) return resolve(null);

      const res = await Promise.all(data.map(s => {
        s.data = { ...s.data };
        const columns = ['id', 'script_id', 'type', 'data', 'position', 'createdAt', 'updatedAt'].join(',');
        const values = ['?', '?', '?', '?', '?', '?', '?'].join(',');
        return dbTransaction<ScriptRow>(`insert or replace into scripts (${columns}) values (${values});`, [
          s.id,
          s.script_id,
          s.type || s.data.type,
          JSON.stringify(s.data),
          s.position,
          s.createdAt,
          s.updatedAt
        ]);
      }));
      resolve(res);
    } catch (e) { reject(e); }
  })();
});

export const deleteScripts = (params = []) => new Promise((resolve, reject) => {
  (async () => {
    try {
      params = params || [];
      if (!params.map) params = [params];

      const res = await Promise.all(params.map(_where => {
        const where = Object.keys(_where).map(key => `${key}=${JSON.stringify(_where[key])}`)
          .join(',');
        let q = 'delete from scripts';
        q = where ? `${q} where ${where}` : q;

        return dbTransaction<ScriptRow>(`${q};`.trim());
      }));
      resolve(res);
    } catch (e) { reject(e); }
  })();
});

export const getScriptsFields = () => new Promise<{ [x: string]: ScriptFields[] }>((resolve, reject) => {
  (async () => {
    try {
      const scripts = await getScripts();
      const rslts = await Promise.all<{ [x: string]: ScriptFields[] }>(scripts.map(script => new Promise((resolve, reject) => {
        (async () => {
          try {
            const screens = await getScreens({ script_id: script.script_id });
            resolve({
              [script.script_id]: screens.map(screen => {
                const metadata = { ...screen.data.metadata };
                const fields = metadata.fields || [];
                return {
                  screen_id: screen.screen_id,
                  script_id: screen.script_id,
                  screen_type: screen.type,
                  keys: (() => {
                    let keys = [];
                    switch (screen.type) {
                      case 'form':
                        keys = fields.map(f => f.key);
                        break;
                      default:
                        keys.push(metadata.key);
                    }
                    return keys.filter(k => k);
                  })(),
                };
              })
            });
          } catch (e) { reject(e); }
        })();
      })));
      resolve(rslts.reduce((acc, s) => ({ ...acc, ...s }), {}));
    } catch (e) { reject(e); }
  })();
});