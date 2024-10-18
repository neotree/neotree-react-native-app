import AsyncStorage from "@react-native-async-storage/async-storage";

import { asyncStorageKeys } from "@/constants";
import logger from "@/lib/logger";
import { getAxiosClient } from '@/lib/axios';
import { DataResponse, RemoteData } from "@/types";
import { isInternetConnected } from "@/lib/network";

type SyncRemoteDataOpts = {
    force?: true,
};

export async function syncRemoteData(options: SyncRemoteDataOpts = {}) {
    try {
        const axios = await getAxiosClient();

        const dataVersion = await AsyncStorage.getItem(asyncStorageKeys.WEBEDITOR_DATA_VERSION);
        const sessionsCount = await AsyncStorage.getItem(asyncStorageKeys.SESSIONS_COUNT);
        const deviceId = await AsyncStorage.getItem(asyncStorageKeys.DEVICE_ID);
        const lastSyncDate = await AsyncStorage.getItem(asyncStorageKeys.LAST_REMOTE_SYNC_DATE);
        const hospitalId = await AsyncStorage.getItem(asyncStorageKeys.HOSPITAL_ID);
        
        const hasInternet = await isInternetConnected();

        if (!hasInternet && !lastSyncDate) throw new Error('No internet connection!');
        
        if (hasInternet) {
            const res = await axios.post<DataResponse<RemoteData>>(`/api/app/device/${deviceId}`, {
                lastSyncDate,
                dataVersion,
                forceSync: options?.force,
                sessionsCount: Number(sessionsCount || '0'),
                hospitalId,
            });
            const { errors, data } = res.data;

            if (errors?.length) throw new Error(errors.join(', '));

            console.log(data);

            // after syncing
            await AsyncStorage.setItem(asyncStorageKeys.LAST_REMOTE_SYNC_DATE, new Date().toUTCString());
        }
    } catch(e: any) {
        logger.log('syncRemoteData ERROR:', e.message);
        throw e;
    }
}