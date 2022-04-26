import makeApiCall from './makeApiCall';

export const getHospitals = (params = {}) => makeApiCall.get('/get-hospitals', params);

export const updateDeviceRegistration = (body = {}, reqOpts = {}) => makeApiCall.post('/update-device-registration', {
  body,
  ...reqOpts,
});

export const getDeviceRegistration = (body = {}, reqOpts = {}) => makeApiCall.get('/get-device-registration', {
  body,
  ...reqOpts,
});

export const syncData = (body = {}, reqOpts = {}) => makeApiCall.get('/sync-data', {
  body,
  ...reqOpts,
});

export const addStats = (body = {}, reqOpts = {}) => makeApiCall.post('/add-stats', {
  body,
  ...reqOpts,
});
