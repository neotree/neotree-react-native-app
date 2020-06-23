import makeApiCall from './makeApiCall';

export const syncData = options => makeApiCall('/sync-data', options);
