import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

import logger from "@/lib/logger";
import { asyncStorageKeys } from "@/constants";

export async function getAxiosClient() {
    const webeditorURL = await AsyncStorage.getItem(asyncStorageKeys.WEBEDITOR_URL);
    let baseURL = webeditorURL || '';

    if (!baseURL) {
        const urls = (process.env.EXPO_PUBLIC_DEV_SITES || '').split(',');
        baseURL = urls[0];
    }

    const apiKey = process.env.EXPO_PUBLIC_API_KEY || '';

    const axiosClient = axios.create({
        baseURL,
    });
    
    axiosClient.interceptors.request.use(async config => {
        if (config.headers) {
            config.headers['x-api-key'] = apiKey;
        }

        logger.log(`[${config.method?.toUpperCase?.()}]`, baseURL + config.url);

        return config;
    });
    
    axiosClient.interceptors.response.use(
        res => res, 
        e => new Promise((_, reject) => {
            return reject(e);
        }),
    );

    return axiosClient;
}
