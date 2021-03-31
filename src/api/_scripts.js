import { dbTransaction } from './database/db';
import { getScreens } from './_screens';

export const getScript = (options = {}) => new Promise((resolve, reject) => {
  (async () => {
    try {
      const { ..._where } = options || {};
      const where = Object.keys(_where).map(key => `${key}=${JSON.stringify(_where[key])}`)
        .join(',');
      let q = 'select * from scripts';
      q = where ? `${q} where ${where}` : q;

      const res = await dbTransaction(`${q} limit 1;`.trim());
      resolve(res.map(s => ({ ...s, data: JSON.parse(s.data || '{}') }))[0]);
    } catch (e) { reject(e); }
  })();
});

export const getScripts = (options = {}) => new Promise((resolve, reject) => {
  (async () => {
    try {
      const { _order, ..._where } = options || {};

      let order = (_order || [['position', 'ASC']]);
      order = (order.map ? order : [])
        .map(keyVal => (!keyVal.map ? '' : `${keyVal[0] || ''} ${keyVal[1] || ''}`).trim())
        .filter(clause => clause)
        .join(',');

      const where = Object.keys(_where).map(key => `${key}=${JSON.stringify(_where[key])}`)
        .join(',');

      let q = 'select * from scripts';
      q = where ? `${q} where ${where}` : q;
      q = order ? `${q} order by ${order}` : q;

      const rows = await dbTransaction(`${q};`.trim());
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
        const columns = ['id', 'script_id', 'data', 'position', 'createdAt', 'updatedAt'].join(',');
        const values = ['?', '?', '?', '?', '?', '?'].join(',');
        return dbTransaction(`insert or replace into scripts (${columns}) values (${values});`, [
          s.id,
          s.script_id,
          JSON.stringify(s.data || {}),
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

        return dbTransaction(`${q};`.trim());
      }));
      resolve(res);
    } catch (e) { reject(e); }
  })();
});

export const getScriptsFields = () => new Promise((resolve, reject) => {
  (async () => {
    try {
      const scripts = await getScripts();
      const rslts = await Promise.all(scripts.map(script => new Promise((resolve, reject) => {
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
