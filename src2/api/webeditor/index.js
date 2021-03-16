import makeApiCall from './makeApiCall';

export const updateDeviceRegistration = (body = {}, reqOpts = {}) => makeApiCall('/update-device-registration', {
  body,
  method: 'POST',
  ...reqOpts,
});

export const getDeviceRegistration = (body = {}, reqOpts = {}) => makeApiCall('/get-device-registration', {
  body,
  ...reqOpts,
});

export const getConfigKey = (body = {}, reqOpts = {}) => makeApiCall('/get-config-key', {
  body,
  ...reqOpts,
});

export const getConfigKeys = (body = {}, reqOpts = {}) => makeApiCall('/get-config-keys', {
  body,
  ...reqOpts,
});

export const getDiagnosis = (body = {}, reqOpts = {}) => makeApiCall('/get-diagnosis', {
  body,
  ...reqOpts,
});

export const getDiagnoses = (body = {}, reqOpts = {}) => makeApiCall('/get-diagnoses', {
  body,
  ...reqOpts,
});

export const getScreen = (body = {}, reqOpts = {}) => makeApiCall('/get-screen', {
  body,
  ...reqOpts,
});

export const getScreens = (body = {}, reqOpts = {}) => makeApiCall('/get-screens', {
  body,
  ...reqOpts,
});

export const getScript = (body = {}, reqOpts = {}) => makeApiCall('/get-script', {
  body,
  ...reqOpts,
});

export const getScripts = (body = {}, reqOpts = {}) => makeApiCall('/get-scripts', {
  body,
  ...reqOpts,
});

export const syncData = (body = {}, reqOpts = {}) => makeApiCall('/sync-data', {
  body,
  ...reqOpts,
});
