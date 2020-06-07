/* global fetch */

export default (url = '', opts = {}) => {
  url = url[0] === '/' ? url : `/${url}`;

  const reqOpts = {
    headers: { ...opts.headers },
  };

  const method = (opts.method || 'GET').toUpperCase();

  if (method === 'GET') {
    url = `${url}?payload=${JSON.stringify(opts.payload || {})}`;
  } else {
    reqOpts.headers['Content-Type'] = 'application/json';
    reqOpts.body = JSON.stringify({ ...opts.payload });
  }

  url = `${opts.apiConfig.api_endpoint}${url}`;

  require('@/utils/logger')(
    `makeApiCall ${(opts.method || 'get').toUpperCase()}:`,
    url,
    reqOpts.body
  );

  return new Promise((resolve, reject) => {
    fetch(url, { method, ...reqOpts })
      .then(res => {
        return res.json();
      })
      .then(res => {
        const error = res.error || res.errors;
        if (error) {
          require('@/utils/logger')(`ERROR: makeApiCall: ${url}`, error.map ? error : [error]);
          return reject(error.map ? error : [error]);
        }
        resolve(res.payload);
      })
      .catch(e => {
        require('@/utils/logger')(`ERROR: makeApiCall: ${url}`, e.map ? e : [e]);
        if (e) reject(e);
      });
  });
};
