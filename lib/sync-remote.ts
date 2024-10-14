import AsyncStorage from "@react-native-async-storage/async-storage";

import { asyncStorageKeys } from "@/constants";
import logger from "@/lib/logger";
import { getAxiosClient } from '@/lib/axios';
import { DataResponse } from "@/types";

export async function syncRemote() {
    try {
        const axios = await getAxiosClient();
        const deviceId = await AsyncStorage.getItem(asyncStorageKeys.DEVICE_ID);
        
        const res = await axios.get<DataResponse<any>>(`/app/device/${deviceId}`);
        const { errors } = res.data;

        if (errors?.length) throw new Error(errors.join(', '));
    } catch(e: any) {
        logger.log('syncRemote ERROR:', e.message);
        throw e;
    }
}