/* global fetch */
import NetInfo from '@react-native-community/netinfo';
import Constants from 'expo-constants';
import queryString from 'query-string';
import { getLocation } from '../_location';

const config = Constants.manifest.extra;

const makeApiCall = (endpoint, params = {}) => new Promise((resolve, reject) => {
  const { country: _country, body, ...opts } = params;

  let url = '';
  let country = _country;

  (async () => {
    try {
      const networkState = await NetInfo.fetch();
      if (!networkState.isInternetReachable) throw new Error('No internet connection');

      if (!country) {
        const location = await getLocation();
        country = location.country;
      }

      const apiConfig = country ? config[country].webeditor : null;
      if (!apiConfig) throw new Error(`Api config for ${country} not found`);

      url = `${apiConfig.api_endpoint}${endpoint}`;
      const reqOpts = {
        ...opts,
        headers: {
          'Content-Type': 'application/json',
          ...opts.headers,
          'x-api-key': apiConfig.api_key,
        }
      };
      if (opts.method === 'GET') {
        url = `${url}?${queryString.stringify(body || {})}`;
      } else {
        reqOpts.headers['Content-Type'] = 'application/json';
        reqOpts.body = JSON.stringify({ ...body });
      }
      console.log(`makeApiCall [${reqOpts.method}]: ${url}`);

      let res = await fetch(url, reqOpts);
      res = await res.json();

      if (res.errors || res.error) throw new Error((res.error ? [res.error] : res.errors).map(e => e.message || e.msg || e).join('\n'));

      resolve(res);
    } catch (e) { console.log(`makeApiCall ERROR: ${url}: `, e); reject(e); }
  })();
});

export default {
  get: (endpoint, params) => makeApiCall(endpoint, { ...params, method: 'GET' }),
  post: (endpoint, params) => makeApiCall(endpoint, { ...params, method: 'POST' }),
};
