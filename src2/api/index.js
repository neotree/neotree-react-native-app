import AppData from './AppData';
import { getScripts, getScreens } from './database';

import * as webeditor from './webeditor';

export * from './auth';

export * from './database';

export * from './nodeapi';

export { webeditor };

export { default as AppData } from './AppData';

export const initialiseAppData = (...args) => new AppData().initlialise(...args);

export const sync = (...args) => new AppData().sync(...args);

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
