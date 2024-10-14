import axios from "axios";

import logger from "@/lib/logger";

export async function getAxiosClient() {
    const baseURL = 'https://zim-dev-webeditor.neotree.org/api';
    const apiKey = '';

    const axiosClient = axios.create({
        baseURL,
    });
    
    axiosClient.interceptors.request.use(async config => {
        if (config.headers) {
            config.headers['x-api-key'] = apiKey;
        }

        logger.log(`[${config.method?.toUpperCase?.()}]`, config.url);

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
