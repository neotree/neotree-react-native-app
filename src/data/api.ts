import 'react-native-get-random-values'
import CryptoJS from 'crypto-js';
import queryString from 'query-string';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_CONFIG } from '@/src/constants';
import * as types from '../types';
import { getLocation } from './queries';
import { getAppRuntimeIdentity } from '../update/appIdentity';
import { getDeviceID } from '../utils/getDeviceID';
import { ASYNC_STORAGE_KEYS } from '../constants/async-storage';


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
    let url = '';
    try {
        const location = await getLocation();
        const country = otherOptions.country || location?.country;

        if (!country) throw new Error('Location not set');

        const config = (APP_CONFIG[country] as types.COUNTRY_CONFIG)[source];

        let api_endpoint = useHost ? config.host : config.api_endpoint;
        api_endpoint[api_endpoint.length - 1] === '/' ? 
            api_endpoint.substring(0, api_endpoint.length - 1) : api_endpoint;

        endpoint = endpoint[0] === '/' ? endpoint.substring(1) : endpoint;
        url = [api_endpoint, endpoint].join('/').replace(/\?+$/, '');

        console.log('[API]: ', url);
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 300000);

        const method = options?.method?.toUpperCase() || 'GET';

        try {
            if(method==='GET') {
                const res = await fetch(url, {
                    ...options,
                    signal: controller.signal,
                    headers: {
                        'Content-Type': 'application/json',
                        ...options.headers,
                        'x-api-key': config.api_key,
                    },
                });
                clearTimeout(timeout);
                return res;
            } else {
                const res = await fetch(url, {
                    ...options,
                    headers: {
                        'Content-Type': 'application/json',
                        ...options.headers,
                        'x-api-key': config.api_key,
                    },
                });
                clearTimeout(timeout);
                return res;
            }
        } catch(err:any) {
            if (err.name === 'AbortError') {
                throw new Error('Network Request Taking Too Longer than the expected 45 Seconds!!');
            }
            throw err;
        }
    } catch(e) {
        // if (process.env.APP_ENV !== 'PROD') console.error(`[ERROR]: ${url}`, e);
        throw e; 
    }
}
export async function makeLocalApiCall( 
    endpoint: string, 
    options: RequestInit = {},
    otherOptions: Partial<(typeof _otherOptions)> = _otherOptions,
) {
    let url = '';
    try {
        const location = await getLocation();
        const country = otherOptions.country || location?.country;

        if (!country) throw new Error('Location not set');

        const config = (APP_CONFIG[country] as types.COUNTRY_CONFIG)['local'];
        if(config && Array.isArray(config)){

        let api_endpoint =  config?.[0].host;
        api_endpoint[api_endpoint.length - 1] === '/' ? 
            api_endpoint.substring(0, api_endpoint.length - 1) : api_endpoint;

        endpoint = endpoint[0] === '/' ? endpoint.substring(1) : endpoint;
        url = [api_endpoint, endpoint].join('/');

        console.log('[API]: ', url);
    
       const sec = config?.[0].secret
        const body =encryptInReactNative(options.body, sec);
        const res = await fetch(url, {
            method:'POST',
            body: JSON.stringify({data:body}),
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
                'x-api-key': config?.[0].api_key,
            }
        });

        if (res.status !== 200) {
            console.log(res);
        }
       

        return res;
    }
    return null
    } catch(e) {
        // if (process.env.APP_ENV !== 'PROD') console.error(`[ERROR]: ${url}`, e);
        throw e; }
}

export async function makeLocalGetApiCall( 
    endpoint: string, 
    options: RequestInit = {},
    otherOptions: Partial<(typeof _otherOptions)> = _otherOptions,
) {
    let url = '';
    try {
        const location = await getLocation();
        const country = otherOptions.country || location?.country;

        if (!country) throw new Error('Location not set');

        const config = (APP_CONFIG[country] as types.COUNTRY_CONFIG)['local'];
        const queryString = endpoint.split('?')[1];
        const params = new URLSearchParams(queryString);
        const hospitalId = params.get("hospital");

        if(!config || !Array.isArray(config) || config.length<=0){
            return null
        }
        if(config.length>0 && config[0]['hospital']!=hospitalId){
            return null
        }
        else{
        let api_endpoint =  config?.[0].host;
        api_endpoint[api_endpoint.length - 1] === '/' ? 
            api_endpoint.substring(0, api_endpoint.length - 1) : api_endpoint;

        endpoint = endpoint[0] === '/' ? endpoint.substring(1) : endpoint;
        url = [api_endpoint, endpoint].join('/');

        console.log('[API]: ', url);
    
       const sec = config?.[0].secret

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000);

          try {

        const res = await fetch(url, {
            method:'GET',
            signal: controller.signal,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
                'x-api-key': config?.[0].api_key,
            }
        });
        
        if (res.status !== 200) {
            console.log(res);
        }
       
        const sessions = decryptInReactNative(await res?.json(),sec)
        clearTimeout(timeout);
        return sessions;
    }catch (err:any) {
        if (err.name === 'AbortError') {
            throw new Error('Local Server Connection Taking Longer Than The Expected 30 Seconds. Check With The Administrator if it is up!!');
        }
        throw err;
       }
    }
   
    } catch(e) {
        // if (process.env.APP_ENV !== 'PROD') console.error(`[ERROR]: ${url}`, e);
        throw e; }
}

export async function hasLocalServerConfig() {
    try {
        const location = await getLocation();
        const country = location?.country;
        if (!country) return false;
        const config = (APP_CONFIG[country] as types.COUNTRY_CONFIG)['local'];
        const hospital = location?.hospital;
        const localConfig = Array.isArray(config) ? config.filter(c => c.hospital === hospital?.trim()) : [];
        return Boolean(localConfig?.[0]?.hospital?.length);
    } catch {
        return false;
    }
}

export const getHospitals = async (params = {}, otherParams: Partial<(typeof _otherOptions)> = {}) => {
	const res = await makeApiCall('webeditor', `/get-hospitals?${queryString.stringify(params)}`, undefined, otherParams);
	const json = await res.json();
	return json.hospitals as types.Hospital[];
};

export const getUpdatePolicy = async (): Promise<types.UpdatePolicyResponse> => {
    const identity = getAppRuntimeIdentity();
    const runtimeVersion = identity.runtimeVersion || '';
    const nativeBuildVersion = identity.nativeBuildVersion || '';
    const deviceId = await getDeviceID();
    const params = `?${queryString.stringify({ runtimeVersion, nativeBuildVersion, deviceId })}`;
    const endpoint = `/mobile/update-policy${params}`;
    const res = await makeApiCall('webeditor', `/mobile/update-policy${params}`, {
        headers: await getMobileDeviceHeaders({ method: 'GET', endpoint }),
    });
    return res.json();
};

const normalizeSignaturePath = (endpoint: string) => {
    try {
        const url = new URL(endpoint);
        return `${url.pathname.replace(/^\/api/, '') || '/'}${url.search || ''}`;
    } catch {
        const value = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
        return value.replace(/^\/api/, '');
    }
};

const createBodyHash = (body?: string | null) => CryptoJS.SHA256(body || '').toString(CryptoJS.enc.Hex);

const createDeviceSignature = ({
    method,
    endpoint,
    timestamp,
    nonce,
    body,
    secret,
}: {
    method: string;
    endpoint: string;
    timestamp: string;
    nonce: string;
    body?: string | null;
    secret: string;
}) => {
    const canonical = [
        method.toUpperCase(),
        normalizeSignaturePath(endpoint),
        timestamp,
        nonce,
        createBodyHash(body),
    ].join('\n');
    return CryptoJS.HmacSHA256(canonical, secret).toString(CryptoJS.enc.Hex);
};

export const getMobileDeviceHeaders = async (opts?: {
    method?: string;
    endpoint?: string;
    body?: string | null;
}) => {
    const deviceId = await getDeviceID();
    const location = await getLocation();
    const country = location?.country;
    const apiKey = country ? (APP_CONFIG[country] as types.COUNTRY_CONFIG)?.webeditor?.api_key : '';
    const secret = await AsyncStorage.getItem(ASYNC_STORAGE_KEYS.DEVICE_AUTH_SECRET);
    const timestamp = new Date().toISOString();
    const nonce = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const signature = secret && opts?.endpoint ? createDeviceSignature({
        method: opts.method || 'GET',
        endpoint: opts.endpoint,
        timestamp,
        nonce,
        body: opts.body || '',
        secret,
    }) : null;

    return {
        'x-device-id': deviceId,
        ...(signature ? {
            'x-device-timestamp': timestamp,
            'x-device-nonce': nonce,
            'x-device-signature': signature,
        } : {}),
        ...(apiKey ? { 'x-api-key': apiKey } : {}),
    };
};

export const postDeviceAppState = async (payload: {
    deviceId: string;
    appVersion: string;
    runtimeVersion: string;
    otaUpdateId?: string | null;
    otaChannel?: string | null;
    apkReleaseId?: string | null;
}): Promise<{ data?: any; errors?: string[]; success?: boolean; }> => {
    const body = JSON.stringify(payload);
    const endpoint = '/mobile/device/app-state';
    const headers = await getMobileDeviceHeaders({ method: 'POST', endpoint, body });
    const res = await makeApiCall('webeditor', '/mobile/device/app-state', {
        method: 'POST',
        headers,
        body,
    });
    return res.json();
};

export const postUpdateEvent = async (payload: {
    deviceId: string;
    eventId?: string;
    eventType: string;
    status?: string | null;
    apkReleaseId?: string | null;
    appVersion?: string | null;
    runtimeVersion?: string | null;
    otaUpdateId?: string | null;
    otaChannel?: string | null;
    errorCode?: string | null;
    errorMessage?: string | null;
    payload?: any;
}): Promise<{ data?: any; errors?: string[]; success?: boolean; }> => {
    const body = JSON.stringify(payload);
    const endpoint = '/mobile/update-events';
    const headers = await getMobileDeviceHeaders({ method: 'POST', endpoint, body });
    const res = await makeApiCall('webeditor', '/mobile/update-events', {
        method: 'POST',
        headers,
        body,
    });
    return res.json();
};

export const reportErrors = async (...args: any[]) => {
    try {
        await makeApiCall('webeditor', `/app/errors`, {
            method: 'POST',
            body: JSON.stringify(args),
        });
    } catch (e) {
        // do nothing
    }
};

function decryptInReactNative(encryptedData: any, secretKey: string): any {
  try {
    // 1. Check for empty input
    if (!encryptedData) {
      console.warn('No encrypted data provided');
      return null;
    }

    // 2. Validate secret key length (AES-256 requires 32 bytes)
    if (secretKey.length !== 32) {
      throw new Error('Invalid secret key length. Must be 32 characters (32 bytes) for AES-256');
    }

    // 3. Split IV and ciphertext using colon separator
    const json = JSON.parse(encryptedData)
    if(json && json.sessions){
    const parts = json.sessions.split(':');
    if (parts.length !== 2) {
      throw new Error('Invalid encrypted data format. Expected IV:ciphertext');
    }

    const [ivBase64, ciphertextBase64] = parts;

    // 4. Validate IV length (16 bytes = 24 Base64 chars)
    if (ivBase64.length !== 24) {
      throw new Error('Invalid IV length. Expected 24 Base64 characters (16 bytes)');
    }

    // 5. Decrypt
    const decrypted = CryptoJS.AES.decrypt(
      ciphertextBase64,
      CryptoJS.enc.Utf8.parse(secretKey),
      { 
        iv: CryptoJS.enc.Base64.parse(ivBase64),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      }
    );

    // 6. Convert to UTF-8 and parse JSON
    const decryptedStr = decrypted.toString(CryptoJS.enc.Utf8);
    
    if (!decryptedStr) {
      throw new Error('Decryption failed - possibly wrong key or corrupted data');
    }
    return JSON.parse(decryptedStr);
}else{
    return null;
}
    
  } catch (error) {
    console.error('Decryption error:', error);
    // Return null or rethrow based on your error handling strategy
    return null;
  }
}

function encryptInReactNative(data:any, secretKey:string) {
  // 1. Generate random IV (16 bytes)
  const iv = CryptoJS.lib.WordArray.random(16);
  // 2. Encrypt (output as Base64)
  const encrypted = CryptoJS.AES.encrypt(
    JSON.stringify(data),
    CryptoJS.enc.Utf8.parse(secretKey),
    {
      iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    }
  ).toString(); // Returns Base64 by default
  
  // 3. Return IV + ciphertext (both Base64)
  return iv.toString(CryptoJS.enc.Base64) + ':' + encrypted
}
