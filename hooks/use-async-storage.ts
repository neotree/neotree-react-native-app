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
    COUNTRY_NAME: 'COUNTRY_NAME',
    HOSPITAL_ID: 'HOSPITAL_ID',
    HOSPITAL_NAME: 'HOSPITAL_NAME',
    APP_VERSION: 'APP_VERSION',
    SDK_VERSION: 'SDK_VERSION',
    SESSIONS_COUNT: 'SESSIONS_COUNT',
    WEBEDITOR_URL: 'WEBEDITOR_URL',
    WEBEDITOR_API_KEY: 'WEBEDITOR_API_KEY',
    WEBEDITOR_DATA_VERSION: 'WEBEDITOR_DATA_VERSION',
} as const;

const sanitiser = {
    INITIAL_SETUP_DATE: (value: string | null) => value ? new Date(value) : null,
    NEOTREE_BUILD_TYPE: (value: string | null) => value! as 'demo' | 'development' | 'stage' | 'production',
    BEARER_TOKEN: (value: string | null) => value || '',
    DEVICE_ID: (value: string | null) => value || '',
    DEVICE_HASH: (value: string | null) => value || '',
    LAST_REMOTE_SYNC_DATE: (value: string | null) => value ? new Date(value) : null,
    COUNTRY_ISO: (value: string | null) => value || '',
    COUNTRY_NAME: (value: string | null) => value || '',
    HOSPITAL_ID: (value: string | null) => value || '',
    HOSPITAL_NAME: (value: string | null) => value || '',
    APP_VERSION: (value: string | null) => value || '',
    SDK_VERSION: (value: string | null) => value || '',
    SESSIONS_COUNT: (value: string | null) => value ? Number(value) : 0,
    WEBEDITOR_URL: (value: string | null) => value || '',
    WEBEDITOR_API_KEY: (value: string | null) => value || '',
    WEBEDITOR_DATA_VERSION: (value: string | null) => value || '',
};

const defaultState = {
    INITIAL_SETUP_DATE: sanitiser.INITIAL_SETUP_DATE(null),
    NEOTREE_BUILD_TYPE: sanitiser.NEOTREE_BUILD_TYPE(null),
    BEARER_TOKEN: sanitiser.BEARER_TOKEN(null),
    DEVICE_ID: sanitiser.DEVICE_ID(null),
    DEVICE_HASH: sanitiser.DEVICE_HASH(null),
    LAST_REMOTE_SYNC_DATE: sanitiser.LAST_REMOTE_SYNC_DATE(null),
    COUNTRY_ISO: sanitiser.COUNTRY_ISO(null),
    COUNTRY_NAME: sanitiser.COUNTRY_NAME(null),
    HOSPITAL_ID: sanitiser.HOSPITAL_ID(null),
    HOSPITAL_NAME: sanitiser.HOSPITAL_NAME(null),
    APP_VERSION: sanitiser.APP_VERSION(null),
    SDK_VERSION: sanitiser.SDK_VERSION(null),
    SESSIONS_COUNT: sanitiser.SESSIONS_COUNT(null),
    WEBEDITOR_URL: sanitiser.WEBEDITOR_URL(null),
    WEBEDITOR_API_KEY: sanitiser.WEBEDITOR_API_KEY(null),
    WEBEDITOR_DATA_VERSION: sanitiser.WEBEDITOR_DATA_VERSION(null),
};

async function getAllItems() {
    try {
        const keys = Object.keys(asyncStorageKeys);
        const allItems = await AsyncStorage.multiGet(keys);
        return keys.reduce((acc, key) => {
            const value = allItems.filter(([_key]) => _key === key).map(([, value]) => value)[0];
            return {
                ...acc,
                [key]: sanitiser[key as keyof typeof asyncStorageKeys]?.(value),
            };
        }, {} as typeof defaultState);
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
const getItem = (key: keyof typeof asyncStorageKeys) => AsyncStorage.getItem(key);

type AsyncStorageItems = typeof defaultState;

export const useAsyncStorage = create<AsyncStorageItems & {
    itemsUpdating: boolean;
    setItem: typeof setItem;
    removeItem: typeof removeItem;
    getItem: typeof getItem;
    getAllItems: typeof getAllItems;
    setItems: typeof setItems;
    init: () => Promise<void>;
    setItemsState: (partialState: Partial<AsyncStorageItems>) => void;
}>(set => {
    const setItemsState: (partialState: Partial<AsyncStorageItems>) => void =  partialState => set(prev => ({
        ...prev,
        ...partialState,
    }));

    const _setItems: typeof setItems = async (params) => {
        try {
            set(prev => ({ ...prev, itemsUpdating: true, }));
            await setItems(params);
            const items = await getAllItems();
            setItemsState({ ...items});
        } catch(e) {
            throw e;
        } finally {
            set(prev => ({ ...prev, itemsUpdating: false, }));
        }
    };

    return {
        ...defaultState,
        itemsUpdating: false,
        setItem,
        removeItem,
        getItem,
        getAllItems,
        setItemsState,
        setItems: _setItems,
        async init() {
            const activeSite = constants.CONFIG.sites[0];
            if (!activeSite) throw new Error('Sites not configured');
    
            const INITIAL_SETUP_DATE = await AsyncStorage.getItem('INITIAL_SETUP_DATE');

            if (INITIAL_SETUP_DATE) {
                const items = await getAllItems();
                setItemsState({ ...items, });
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
                COUNTRY_NAME: activeSite.countryName || '',
                SESSIONS_COUNT: '0',
                HOSPITAL_ID: '',
                HOSPITAL_NAME: '',
                WEBEDITOR_DATA_VERSION: '',
                BEARER_TOKEN: '',
                DEVICE_HASH: '',
                LAST_REMOTE_SYNC_DATE: '',
            });
        },
    };
});