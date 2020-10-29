/* global fetch, __DEV__ */
import queryString from 'query-string';

const apiConfig = __DEV__ ? require('~/config/neotree-nodeapi-api.json') : require('~/config/prod-neotree-nodeapi-api.json');

export default (url = '', opts = {}) => new Promise((resolve, reject) => {
  url = `${apiConfig.api_endpoint}${url}`;

  const { body, method: m, ...reqOpts } = opts;
  reqOpts.headers = { 'x-api-key': apiConfig.api_key, ...reqOpts.headers };
  const method = (m || 'GET').toUpperCase();

  if (method === 'GET') {
    url = `${url}?${queryString.stringify(body || {})}`;
  } else {
    reqOpts.headers['Content-Type'] = 'application/json';
    reqOpts.body = JSON.stringify({ ...body });
  }

  require('@/utils/logger')(`makeApiCall: ${url}: `, JSON.stringify(reqOpts));

  return fetch(url, { method, ...reqOpts })
    .then(res => new Promise((resolve, reject) => {
      res.text()
        .then(text => {
          if (res.status === 200) return resolve(text);
          reject(text);
        })
        .catch(reject);
    }))
    .then(res => resolve(res))
    .catch(e => {
      require('@/utils/logger')(`makeApiCall ERROR: ${url}: `, e);
      reject(e);
    });
});
