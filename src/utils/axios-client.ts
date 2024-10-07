import axios from 'axios';

import { APP_CONFIG } from '@/src/constants';
import { getLocation } from '@/src/data/queries';
import * as types from '@/src/types';

const axiosClient = axios.create();

axiosClient.interceptors.request.use(async config => {
    const location = await getLocation();
    const country = location?.country;

    if (!country) throw new Error('Location not set');

    const { api_endpoint, api_key } = (APP_CONFIG[country] as types.COUNTRY_CONFIG).webeditor;

    api_endpoint[api_endpoint.length - 1] === '/' ? 
        api_endpoint.substring(0, api_endpoint.length - 1) : api_endpoint;

    config.baseURL = api_endpoint;

	if (config.headers) {
		config.headers['x-api-key'] = `${api_key || ''}`;
	}
	console.log(config.method, [config.baseURL, config.url].join(''));
	return config;
});

axiosClient.interceptors.response.use(
	res => res, 
	e => new Promise((_, reject) => {
		return reject(e);
	}),
);

export default axiosClient;
