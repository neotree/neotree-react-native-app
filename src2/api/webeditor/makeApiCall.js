/* global fetch */
import { CONFIG } from '@/constants';
import { dbTransaction } from '../database/db';

export default (url = '', opts = {}) => new Promise((resolve, reject) => {
  (async () => {
    try {
      const location = await dbTransaction('select * from location where id=1;');
      if (!location || (location && !location.country)) return reject(new Error('Country is not setup'));

      const apiConfig = CONFIG[location.country] ? CONFIG[location.country].webeditor : null;
      if (!apiConfig) return reject(new Error(`Api config for ${location.country} not found`));

      url = `${apiConfig.api_endpoint}${url}`;
      const _opts = { ...opts, headers: { ...opts.headers, 'x-api-key': apiConfig.api_key, } };
      console.log(`makeApiCall: ${url}: `, JSON.stringify(_opts));

      let res = await fetch(url, _opts);
      res = await res.json();

      if (res.errors || res.error) {
        const error = (res.error ? [res.error] : res.errors).map(e => e.message || e.msg || e).join('\n');
        console.log(`makeApiCall ERROR: ${url}: `, error);
        reject(new Error(error));
      }

      resolve(res);
    } catch (e) {
      console.log(`makeApiCall ERROR: ${url}: `, e);
      reject(e);
    }
  })();
});
