import Constants from 'expo-constants';

export const APP_VERSION: string = Constants.expoConfig?.version!;
export const SDK_VERSION: string = Constants.expoConfig?.sdkVersion!;

export const asyncStorageKeys = {
    BEARER_TOKEN: 'BEARER_TOKEN',
    DEVICE_ID: 'DEVICE_ID',
    DEVICE_HASH: 'DEVICE_HASH',
    LAST_REMOTE_SYNC_DATE: 'LAST_REMOTE_SYNC_DATE',
    COUNTRY_ISO: 'COUNTRY_ISO',
    HOSPITAL_ID: 'HOSPITAL_ID',
    APP_VERSION: 'APP_VERSION',
    SDK_VERSION: 'SDK_VERSION',
    SESSIONS_COUNT: 'SESSIONS_COUNT',
};

export const assets = {
    logo: require('@/assets/images/logo.png'),
    logoDark: require('@/assets/images/logo-dark.png'),
    appIcon: require('@/assets/images/icon.png'),
};