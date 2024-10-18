import axios from "axios";

import logger from "@/lib/logger";
import AsyncStorage from "@/data/async-storage";

export async function getAxiosClient() {
    const { WEBEDITOR_URL, WEBEDITOR_API_KEY, BEARER_TOKEN } = await AsyncStorage.getAll();

    const webeditorURL = WEBEDITOR_URL;
    const webeditorApiKey = WEBEDITOR_API_KEY;
    const bearerToken = BEARER_TOKEN;

    const baseURL = webeditorURL!;
    const apiKey = webeditorApiKey!;

    const axiosClient = axios.create({
        baseURL,
    });
    
    axiosClient.interceptors.request.use(async config => {
        if (config.headers) {
            config.headers['x-api-key'] = apiKey || '';
            config.headers['x-bearer-token'] = bearerToken || '';
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
