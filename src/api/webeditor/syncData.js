import makeApiCall from './makeApiCall';

export const syncData = (body = {}, reqOpts = {}) => makeApiCall('/sync-data', {
    body,
    ...reqOpts,
});
