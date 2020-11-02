import constants from '@/constants';
import makeApiCall from '../makeApiCall';

const isProd = constants.BUILD_TYPE === 'production';
const apiConfig = isProd ? require('~/config/prod-neotree-webeditor-api.json') : require('~/config/neotree-webeditor-api.json');

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
