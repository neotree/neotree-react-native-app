import Constants from 'expo-constants';
import { COUNTRY_CONFIG } from '../types';
import { getLocation } from './queries';
import {handleAppCrush} from '../utils/handleCrashes'

const CONFIGURATION = (Constants.manifest?.extra || {}) as any;

const _otherOptions = {
    useHost: false,
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
        const country = location?.country;

        if (!country) throw new Error('Location not set');

        const config = (CONFIGURATION[country] as COUNTRY_CONFIG)[source];

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
    } catch(e) {
        handleAppCrush(e)
        throw e; }
}
