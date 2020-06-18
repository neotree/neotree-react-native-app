import apiConfig from '~/config/neotree-webeditor-api.json';
import makeApiCall from '../makeApiCall';

export default (url = '', opts = {}) => new Promise((resolve, reject) => {
  url = `${apiConfig.api_endpoint}${url}`;
  makeApiCall(url, {
    ...opts,
    apiConfig,
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
      resolve(res.payload);
    });
});
