/* global fetch */
import queryString from 'query-string';
import apiConfig from '~/config/ehr-api.json';

export default (url = '', opts = {}) => new Promise((resolve, reject) => {
  url = `${apiConfig.api_endpoint}${url}`;

  const {body, method: m, ...reqOpts} = opts;  
  if(!url.includes('/authenticate')){
  const {jwtToken } = opts;  
  reqOpts.headers = { Authorization: `Bearer ${jwtToken}`, ...reqOpts.headers };
  }
  else{
    reqOpts.headers = {...reqOpts.headers};
  }
    const method = (m || 'PUT').toUpperCase();
    reqOpts.headers['Content-Type'] = 'application/json';
    reqOpts.body = JSON.stringify({ ...body });
   require('@/utils/logger')(`makeEHRApiCall: ${url}: `, JSON.stringify(reqOpts));
  return fetch(url, { method, ...reqOpts })
    .then(res => new Promise((resolve, reject) => {
      res.text()
        .then(text => {
          if (res.status === 200|| res.status === 201) 
          {
            return resolve(text);
          }   
          reject(text);
        })
        .catch(reject);
    }))
    .then(res => resolve(res))
    .catch(e => {
      require('@/utils/logger')(`makeEHRApiCall ERROR: ${url}: `, e);
      reject(e);
    });
});
