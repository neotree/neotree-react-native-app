import { CONFIG } from '@/constants';
import makeApiCall from '../makeApiCall';

const apiConfig = CONFIG.webeditorConfig;

export default (url = '', opts = {}) => new Promise((resolve, reject) => {
  url = `${apiConfig.api_endpoint}${url}`;
  makeApiCall(url, {
    ...opts,
    headers: {
      ...opts.headers,
      'x-api-key': apiConfig.api_key,
    },
  })
    .catch(reject)
    .then((res = {}) => {
      const error = res.error || res.errors;
      if (error) {
        require('@/utils/logger')(`ERROR: makeApiCall: ${url}`, error.map ? error : [error]);
        return reject(error.map ? error : [error]);
      }
      resolve(res);
    });
});
