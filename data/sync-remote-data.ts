import AsyncStorage from "@react-native-async-storage/async-storage";

import { asyncStorageKeys } from "@/constants";
import logger from "@/lib/logger";
import { getAxiosClient } from '@/lib/axios';
import { DataResponse } from "@/types";
import { isInternetConnected } from "@/lib/network";

export async function syncRemoteData() {
    try {
        const deviceId = await AsyncStorage.getItem(asyncStorageKeys.DEVICE_ID);
        const lastSyncDate = await AsyncStorage.getItem(asyncStorageKeys.LAST_REMOTE_SYNC_DATE);
        const axios = await getAxiosClient();
        const hasInternet = await isInternetConnected();

        if (!hasInternet && !lastSyncDate) throw new Error('No internet connection!');

        let shouldSync = hasInternet;
        
        if (shouldSync) {
            // const res = await axios.get<DataResponse<any>>(`/app/device/${deviceId}`);
            // const { errors, data, device } = res.data;

            // if (errors?.length) throw new Error(errors.join(', '));

            const res = await axios.get<DataResponse<any>>(`/get-device-registration?deviceId=${deviceId}`);

            console.log(res.data);

            // after syncing
            await AsyncStorage.setItem(asyncStorageKeys.LAST_REMOTE_SYNC_DATE, new Date().toUTCString());
        }
    } catch(e: any) {
        logger.log('syncRemote ERROR:', e.message);
        throw e;
    }
}