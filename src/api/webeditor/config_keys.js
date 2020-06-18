import makeApiCall from './makeApiCall';

export const getConfigKey = options => makeApiCall('/get-config-key', options);

export const getConfigKeys = options => makeApiCall('/get-config-keys', options);
