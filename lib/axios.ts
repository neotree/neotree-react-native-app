import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

import logger from "@/lib/logger";
import { asyncStorageKeys } from "@/constants";

export async function getAxiosClient() {
    const webeditorURL = await AsyncStorage.getItem(asyncStorageKeys.WEBEDITOR_URL);
    const webeditorApiKey = await AsyncStorage.getItem(asyncStorageKeys.WEBEDITOR_API_KEY);

    const baseURL = webeditorURL!;
    const apiKey = webeditorApiKey!;

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
