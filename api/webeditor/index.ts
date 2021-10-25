import makeApiCall from './makeApiCall';
import * as types from '../types';

export const getHospitals = (params = {}) => makeApiCall.get('/get-hospitals', params);

export const updateDeviceRegistration = (body = {}, reqOpts = {}) => makeApiCall.post('/update-device-registration', {
  body,
  ...reqOpts,
});

export const getDeviceRegistration = (body = {}, reqOpts = {}) => makeApiCall.get('/get-device-registration', {
  body,
  ...reqOpts,
});

export type SyncDataRes = {
  scripts: types.Script[],
  screens: types.Screen[],
  configKeys: types.ConfigKey[],
  diagnoses: types.Diagnosis[],
  deletedScripts: types.Script[],
  deletedScreens: types.Screen[],
  deletedConfigKeys: types.ConfigKey[],
  deletedDiagnoses: types.Diagnosis[],
};

export const syncData = (body = {}, reqOpts = {}): Promise<SyncDataRes> => makeApiCall.get('/sync-data', {
  body,
  ...reqOpts,
});
