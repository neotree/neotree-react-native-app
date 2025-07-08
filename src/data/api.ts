import 'react-native-get-random-values'
import CryptoJS from 'crypto-js';
import queryString from 'query-string';
import { APP_CONFIG } from '@/src/constants';
import * as types from '../types';
import { getLocation } from './queries';


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
        url = [api_endpoint, endpoint].join('/');

        console.log('[API]: ', url);

        const res = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
                'x-api-key': config.api_key,
            },
            
        });

        if (res.status !== 200) {
            console.log(res);
        }

        return res;
    } catch(e) {
        // if (process.env.APP_ENV !== 'PROD') console.error(`[ERROR]: ${url}`, e);
        throw e; }
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
        if(!config){
            return null
        }
        if(Array.isArray(config)){

        let api_endpoint =  config?.[0].host;
        api_endpoint[api_endpoint.length - 1] === '/' ? 
            api_endpoint.substring(0, api_endpoint.length - 1) : api_endpoint;

        endpoint = endpoint[0] === '/' ? endpoint.substring(1) : endpoint;
        url = [api_endpoint, endpoint].join('/');

        console.log('[API]: ', url);
    
       const sec = config?.[0].secret

        const res = await fetch(url, {
            method:'GET',
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
       
        return sessions;
    }
    return null
    } catch(e) {
        // if (process.env.APP_ENV !== 'PROD') console.error(`[ERROR]: ${url}`, e);
        throw e; }
}

export const getHospitals = async (params = {}, otherParams: Partial<(typeof _otherOptions)> = {}) => {
	const res = await makeApiCall('webeditor', `/get-hospitals?${queryString.stringify(params)}`, undefined, otherParams);
	const json = await res.json();
	return json.hospitals as types.Hospital[];
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