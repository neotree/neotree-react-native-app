import AsyncStorage from "@react-native-async-storage/async-storage";

import { asyncStorageKeys } from "@/constants";
import logger from "@/lib/logger";
import { getAxiosClient } from '@/lib/axios';
import { DataResponse, RemoteData } from "@/types";
import { isInternetConnected } from "@/lib/network";
import { useAsyncStorage } from "@/hooks/use-async-storage";

type SyncRemoteDataOpts = {
    force?: true,
};

export async function syncRemoteData(options: SyncRemoteDataOpts = {}) {
    try {
        const axios = await getAxiosClient();

        const {
            WEBEDITOR_DATA_VERSION,
            SESSIONS_COUNT,
            DEVICE_ID,
            LAST_REMOTE_SYNC_DATE,
            HOSPITAL_ID,
        } = await useAsyncStorage.getState().getAllItems();
        
        const hasInternet = await isInternetConnected();

        if (!hasInternet && !LAST_REMOTE_SYNC_DATE) throw new Error('No internet connection!');
        
        if (hasInternet) {
            const res = await axios.post<DataResponse<RemoteData>>(`/api/app/device/${DEVICE_ID}`, {
                lastSyncDate: LAST_REMOTE_SYNC_DATE,
                dataVersion: WEBEDITOR_DATA_VERSION,
                forceSync: options?.force,
                sessionsCount: Number(SESSIONS_COUNT || '0'),
                hospitalId: HOSPITAL_ID,
            });
            const { errors, data } = res.data;

            if (errors?.length) throw new Error(errors.join(', '));

            console.log('SYNC data.newData', data.newData);

            if (data.newData) {
                
            }

            // after syncing
            await AsyncStorage.setItem(asyncStorageKeys.LAST_REMOTE_SYNC_DATE, new Date().toUTCString());
        }
    } catch(e: any) {
        logger.log('syncRemoteData ERROR:', e.message);
        throw e;
    }
}