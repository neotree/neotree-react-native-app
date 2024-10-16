import Constants from 'expo-constants';

import { Config } from '@/types';

export const CONFIG = {
    ...Constants.expoConfig?.extra,
} as Config;

export const APP_VERSION: string = Constants.expoConfig?.version!;
export const SDK_VERSION: string = Constants.expoConfig?.sdkVersion!;
export const NEOTREE_BUILD_TYPE = (process.env.NEOTREE_BUILD_TYPE || 'development') as 'development' | 'stage' | 'production' | 'demo';

export const asyncStorageKeys = {
    INITIAL_SETUP_DATE: 'INITIAL_SETUP_DATE',
    BEARER_TOKEN: 'BEARER_TOKEN',
    DEVICE_ID: 'DEVICE_ID',
    DEVICE_HASH: 'DEVICE_HASH',
    LAST_REMOTE_SYNC_DATE: 'LAST_REMOTE_SYNC_DATE',
    COUNTRY_ISO: 'COUNTRY_ISO',
    HOSPITAL_ID: 'HOSPITAL_ID',
    APP_VERSION: 'APP_VERSION',
    SDK_VERSION: 'SDK_VERSION',
    SESSIONS_COUNT: 'SESSIONS_COUNT',
    WEBEDITOR_URL: 'WEBEDITOR_URL',
    WEBEDITOR_API_KEY: 'WEBEDITOR_API_KEY',
    WEBEDITOR_DATA_VERSION: 'WEBEDITOR_VERSION',
};

export const assets = {
    logo: require('@/assets/images/logo.png'),
    logoDark: require('@/assets/images/logo-dark.png'),
    appIcon: require('@/assets/images/icon.png'),
};