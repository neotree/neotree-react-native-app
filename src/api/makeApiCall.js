/* global fetch */
import apiConfig from '~/config/api.config.json';

export default (url = '', opts = {}) => {
  url = url[0] === '/' ? url : `/${url}`;

  let reqOpts = {
    headers: {
      ...opts.headers,
      'x-api-key': apiConfig.api_key,
    },
  };

  if (!opts.method || (opts.method === 'GET') || (opts.method === 'get')) {
    url = `${url}?payload=${JSON.stringify(opts.payload || {})}`;
  } else {
    reqOpts = {
      ...reqOpts,
      body: JSON.stringify({ payload: opts.payload || {} }),
    };
  }

  return new Promise((resolve, reject) => {
    fetch(`${apiConfig.api_endpoint}${url}`, reqOpts)
      .then(res => {
        return res.json();
      })
      .then(res => {
        const error = res.error || res.errors;
        if (error) return reject(error.map ? error : [error]);
        resolve(res.payload);
      })
      .catch(e => reject(e.map ? e : [e]));
  });
};
