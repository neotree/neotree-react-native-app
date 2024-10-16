import AsyncStorage from "@react-native-async-storage/async-storage";
import queryString from "query-string";

import { asyncStorageKeys } from "@/constants";
import logger from "@/lib/logger";
import { getAxiosClient } from '@/lib/axios';
import { DataResponse } from "@/types";
import { isInternetConnected } from "@/lib/network";
import { db } from "./db";
import { hospitals as hospitalsTable } from "./schema";

type SyncRemoteDataOpts = {
    force?: true,
};

export async function syncRemoteData(options: SyncRemoteDataOpts = {}) {
    try {
        const dataVersion = await AsyncStorage.getItem(asyncStorageKeys.WEBEDITOR_DATA_VERSION);
        const webeditorURL = await AsyncStorage.getItem(asyncStorageKeys.WEBEDITOR_URL);
        const deviceId = await AsyncStorage.getItem(asyncStorageKeys.DEVICE_ID);
        const lastSyncDate = await AsyncStorage.getItem(asyncStorageKeys.LAST_REMOTE_SYNC_DATE);
        const axios = await getAxiosClient();
        const hasInternet = await isInternetConnected();

        if (!hasInternet && !lastSyncDate) throw new Error('No internet connection!');
        
        if (hasInternet) {
            const res = await axios.get<DataResponse<any>>(`/api/app/device/${deviceId}?` + queryString.stringify({
                lastSyncDate,
                dataVersion,
                forceSync: options?.force,
            }));
            // const { errors, data, device } = res.data;

            // if (errors?.length) throw new Error(errors.join(', '));

            // after syncing
            await AsyncStorage.setItem(asyncStorageKeys.LAST_REMOTE_SYNC_DATE, new Date().toUTCString());
        }
    } catch(e: any) {
        logger.log('syncRemoteData ERROR:', e.message);
        throw e;
    }
}