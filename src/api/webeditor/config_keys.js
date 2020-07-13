import makeApiCall from './makeApiCall';

export const getConfigKey = (body = {}, reqOpts = {}) => makeApiCall('/get-config-key', {
    body,
    ...reqOpts,
});

export const getConfigKeys = (body = {}, reqOpts = {}) => makeApiCall('/get-config-keys', {
    body,
    ...reqOpts,
});
