/* global fetch */
import queryString from 'query-string';

export default (url = '', opts = {}) => {
  const { body, method: m, ...reqOpts } = opts;
  reqOpts.headers = { ...reqOpts.headers };
  const method = (m || 'GET').toUpperCase();

  if (method === 'GET') {
    url = `${url}?${queryString.stringify(body || {})}`;
  } else {
    reqOpts.headers['Content-Type'] = 'application/json';
    reqOpts.body = JSON.stringify({ ...body });
  }

  require('@/utils/logger')(`makeApiCall: ${url}: `, JSON.stringify(reqOpts));

  return new Promise((resolve, reject) => {
    (async () => {
      try {
        const res = await fetch(url, { method, ...reqOpts });
        const json = await res.json();
        resolve(json);
      } catch (e) {
        require('@/utils/logger')(`makeApiCall ERROR: ${url}: `, e);
        reject(e);
      }
    })();
  });
};