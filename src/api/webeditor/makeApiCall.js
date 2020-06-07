import apiConfig from '~/config/neotree-webeditor-api.json';
import makeApiCall from '../makeApiCall';

export default (url = '', opts = {}) => makeApiCall(url, {
  ...opts,
  apiConfig,
  headers: {
    ...opts.headers,
    'x-api-key': apiConfig.api_key,
  },
});
