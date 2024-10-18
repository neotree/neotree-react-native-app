import RNAsyncStorage from "@react-native-async-storage/async-storage";

import * as constants from '@/constants';
import { getDeviceID } from "@/lib/device";

export const asyncStorageKeys = {
    INITIAL_SETUP_DATE: 'INITIAL_SETUP_DATE',
    NEOTREE_BUILD_TYPE: 'NEOTREE_BUILD_TYPE',
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
    WEBEDITOR_DATA_VERSION: 'WEBEDITOR_DATA_VERSION',
} as const;

async function getAll() {
    try {
        const keys = [
            asyncStorageKeys.INITIAL_SETUP_DATE,
            asyncStorageKeys.NEOTREE_BUILD_TYPE,
            asyncStorageKeys.BEARER_TOKEN,
            asyncStorageKeys.DEVICE_ID,
            asyncStorageKeys.DEVICE_HASH,
            asyncStorageKeys.LAST_REMOTE_SYNC_DATE,
            asyncStorageKeys.COUNTRY_ISO,
            asyncStorageKeys.HOSPITAL_ID,
            asyncStorageKeys.APP_VERSION,
            asyncStorageKeys.SDK_VERSION,
            asyncStorageKeys.SESSIONS_COUNT,
            asyncStorageKeys.WEBEDITOR_URL,
            asyncStorageKeys.WEBEDITOR_API_KEY,
            asyncStorageKeys.WEBEDITOR_DATA_VERSION,
        ] satisfies (keyof typeof asyncStorageKeys)[];

        const [
            [, INITIAL_SETUP_DATE],
            [, NEOTREE_BUILD_TYPE],
            [, BEARER_TOKEN],
            [, DEVICE_ID],
            [, DEVICE_HASH],
            [, LAST_REMOTE_SYNC_DATE],
            [, COUNTRY_ISO],
            [, HOSPITAL_ID],
            [, APP_VERSION],
            [, SDK_VERSION],
            [, SESSIONS_COUNT],
            [, WEBEDITOR_URL],
            [, WEBEDITOR_API_KEY],
            [, WEBEDITOR_DATA_VERSION],
        ] = await RNAsyncStorage.multiGet(keys);

        return {
            INITIAL_SETUP_DATE: INITIAL_SETUP_DATE ? new Date(INITIAL_SETUP_DATE) : null,
            NEOTREE_BUILD_TYPE: NEOTREE_BUILD_TYPE! as 'demo' | 'development' | 'stage' | 'production',
            BEARER_TOKEN: BEARER_TOKEN || '',
            DEVICE_ID: DEVICE_ID || '',
            DEVICE_HASH: DEVICE_HASH || '',
            LAST_REMOTE_SYNC_DATE: LAST_REMOTE_SYNC_DATE ? new Date(LAST_REMOTE_SYNC_DATE) : null,
            COUNTRY_ISO: COUNTRY_ISO || '',
            HOSPITAL_ID: HOSPITAL_ID || '',
            APP_VERSION: APP_VERSION || '',
            SDK_VERSION: SDK_VERSION || '',
            SESSIONS_COUNT: SESSIONS_COUNT ? Number(SESSIONS_COUNT) : 0,
            WEBEDITOR_URL: WEBEDITOR_URL || '',
            WEBEDITOR_API_KEY: WEBEDITOR_API_KEY || '',
            WEBEDITOR_DATA_VERSION: WEBEDITOR_DATA_VERSION || '',
        };
    } catch(e) {
        throw e;
    }
};

const AsyncStorage = {
    getAll,

    async getItem(key: keyof typeof asyncStorageKeys) {
        try {
            const res = await RNAsyncStorage.getItem(key);
            return res;
        } catch(e: any) {
            throw e;
        }
    },

    async setItem(key: keyof typeof asyncStorageKeys, value: string) {
        try {
            await RNAsyncStorage.setItem(key, value);
        } catch(e: any) {
            throw e;
        }
    },

    async removeItem(key: keyof typeof asyncStorageKeys) {
        try {
            await RNAsyncStorage.removeItem(key);
        } catch(e: any) {
            throw e;
        }
    },

    async init() {
        const activeSite = constants.CONFIG.sites[0];
        if (!activeSite) throw new Error('Sites not configured');

        const INITIAL_SETUP_DATE = await RNAsyncStorage.getItem('INITIAL_SETUP_DATE');

        if (!INITIAL_SETUP_DATE) {
            const deviceId = await getDeviceID();
            await RNAsyncStorage.multiSet([
                [asyncStorageKeys.APP_VERSION, constants.APP_VERSION],
                [asyncStorageKeys.SDK_VERSION, constants.SDK_VERSION],
                [asyncStorageKeys.APP_VERSION, constants.APP_VERSION],
                [asyncStorageKeys.INITIAL_SETUP_DATE, new Date().toUTCString()],
                [asyncStorageKeys.NEOTREE_BUILD_TYPE, constants.NEOTREE_BUILD_TYPE],
                [asyncStorageKeys.DEVICE_ID, deviceId],
                [asyncStorageKeys.WEBEDITOR_URL, activeSite.webeditorURL],
                [asyncStorageKeys.WEBEDITOR_API_KEY, activeSite.apiKey],
                [asyncStorageKeys.COUNTRY_ISO, activeSite.countryISO],
                [asyncStorageKeys.SESSIONS_COUNT, '0'],
                [asyncStorageKeys.HOSPITAL_ID, ''],
                [asyncStorageKeys.WEBEDITOR_DATA_VERSION, ''],
                [asyncStorageKeys.BEARER_TOKEN, ''],
                [asyncStorageKeys.DEVICE_HASH, ''],
                [asyncStorageKeys.LAST_REMOTE_SYNC_DATE, ''],
            ] satisfies [keyof typeof asyncStorageKeys, string][]);
        }
    },
};

export default AsyncStorage;