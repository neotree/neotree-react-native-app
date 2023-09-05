import Constants from 'expo-constants';
import queryString from 'query-string';
import * as types from '../types';
import { getLocation } from './queries';

const CONFIGURATION = (Constants.manifest?.extra || {}) as any;

const _otherOptions = {
    useHost: false,
	country: '',
};

export async function makeApiCall(
    source: 'webeditor' | 'nodeapi', 
    endpoint: string, 
    options: RequestInit = {},
    otherOptions: Partial<(typeof _otherOptions)> = _otherOptions,
) {
    const { useHost } = { ..._otherOptions, ...otherOptions, };
    try {
        const location = await getLocation();
        const country = otherOptions.country || location?.country;

        if (!country) throw new Error('Location not set');

        const config = (CONFIGURATION[country] as types.COUNTRY_CONFIG)[source];

        let api_endpoint = useHost ? config.host : config.api_endpoint;
        api_endpoint[api_endpoint.length - 1] === '/' ? 
            api_endpoint.substring(0, api_endpoint.length - 1) : api_endpoint;

        endpoint = endpoint[0] === '/' ? endpoint.substring(1) : endpoint;
        const url = [api_endpoint, endpoint].join('/');

        console.log('[API]: ', url);

        return await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
                'x-api-key': config.api_key,
            }
        });
    } catch(e) { throw e; }
}

export const getHospitals = async (params = {}, otherParams: Partial<(typeof _otherOptions)> = {}) => {
	const res = await makeApiCall('webeditor', `/get-hospitals?${queryString.stringify(params)}`, undefined, otherParams);
	const json = await res.json();
	return json.hospitals as types.Hospital[];
};
