import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

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

async function getAllItems() {
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
        ] = await AsyncStorage.multiGet(keys);

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
}

async function setItems(params: Partial<Record<keyof typeof asyncStorageKeys, string>>) {
    const data = Object.keys(params).map((key, i) => [key, Object.values(params)[i]] as [string, string]);
    if (data.length) await AsyncStorage.multiSet(data);
}

const setItem = (key: keyof typeof asyncStorageKeys, value: string) => AsyncStorage.setItem(key, value);
const removeItem = (key: keyof typeof asyncStorageKeys) => AsyncStorage.removeItem(key);
const getItem = (key: keyof typeof asyncStorageKeys, value: string) => AsyncStorage.getItem(key);

type AsyncStorageState = Awaited<ReturnType<typeof getAllItems>>;

const defaultState = null! as AsyncStorageState;

export const useAsyncStorage = create<AsyncStorageState & {
    setItem: typeof setItem;
    removeItem: typeof removeItem;
    getItem: typeof getItem;
    getAllItems: typeof getAllItems;
    setItems: typeof setItems;
    init: () => Promise<void>;
}>(set => {
    const setState: (partialState: Partial<AsyncStorageState>) => void =  partialState => set(prev => ({
        ...prev,
        state: { ...partialState },
    }));

    const _setItems: typeof setItems = async (params) => {
        await setItems(params);
        const items = await getAllItems();
        setState({ ...items});
    };

    return {
        ...defaultState,
        setItem,
        removeItem,
        getItem,
        getAllItems,
        setItems: _setItems,
        async init() {
            const activeSite = constants.CONFIG.sites[0];
            if (!activeSite) throw new Error('Sites not configured');
    
            const INITIAL_SETUP_DATE = await AsyncStorage.getItem('INITIAL_SETUP_DATE');

            if (INITIAL_SETUP_DATE) {
                const items = await getAllItems();
                setState({ ...items, });
                await new Promise(resolve => setTimeout(resolve, 100));
                return;
            }
    
            const deviceId = await getDeviceID();
            await _setItems({
                APP_VERSION: constants.APP_VERSION || '',
                SDK_VERSION: constants.SDK_VERSION || '',
                INITIAL_SETUP_DATE: new Date().toUTCString(),
                NEOTREE_BUILD_TYPE: constants.NEOTREE_BUILD_TYPE || '',
                DEVICE_ID: deviceId || '',
                WEBEDITOR_URL: activeSite.webeditorURL || '',
                WEBEDITOR_API_KEY: activeSite.apiKey || '',
                COUNTRY_ISO: activeSite.countryISO || '',
                SESSIONS_COUNT: '0',
                HOSPITAL_ID: '',
                WEBEDITOR_DATA_VERSION: '',
                BEARER_TOKEN: '',
                DEVICE_HASH: '',
                LAST_REMOTE_SYNC_DATE: '',
            });
        },
    };
});