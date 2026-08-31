import 'react-native-get-random-values'
import CryptoJS from 'crypto-js';
import queryString from 'query-string';
import { APP_CONFIG } from '@/src/constants';
import * as types from '../types';
import { getLocation } from './queries';
import {
    acquireAttempt,
    recordSuccess,
    recordFailure,
    backendKey,
    NetworkUnavailableError,
} from './circuitBreaker';
import { logError, type ErrorSource } from '@/src/utils/logError';

const PROBE_TIMEOUT_MS = 15_000;
const REMOTE_TIMEOUT_MS = 60_000;
const LOCAL_TIMEOUT_MS = 30_000;

export const SYNC_DOWNLOAD_TIMEOUT_MS = 300_000;
export const REMOTE_PROBE_TIMEOUT_MS = PROBE_TIMEOUT_MS;

const _otherOptions = {
    useHost: false,
	country: '',
	hospital: '',
	timeout: REMOTE_TIMEOUT_MS,
};

// Endpoint on the webeditor that receives device exceptions. Every exception
// is sent here regardless of which backend it came from - the `source` field on
// the payload says which. Change this in one place if the webeditor grows a
// dedicated exceptions route.
export const EDITOR_EXCEPTIONS_ENDPOINT = '/app/errors';

// Attribute a failure to the backend it came from, so logError records the
// right `source` without every catch block in the app having to name one. An
// error that already carries a source keeps it, so a nodeapi failure bubbling
// up through an outer call is not re-attributed to the outer backend.
function tagErrorSource<T>(error: T, source: ErrorSource): T {
    try {
        if (error && typeof error === 'object' && !(error as any).source) {
            (error as any).source = source;
        }
    } catch {
        // Frozen or exotic error object - attribution is best-effort.
    }
    return error;
}

export function resolveLocalServer(country: string | null | undefined, hospital: string | null | undefined) {
    if (!country) return null;
    const config = (APP_CONFIG[country] as types.COUNTRY_CONFIG)?.['local'];
    if (!Array.isArray(config) || !config.length) return null;
    const trimmedHospital = hospital?.trim();
    if (!trimmedHospital) return null;
    return config.find(c => c.hospital === trimmedHospital) || null;
}

export async function makeApiCall(
    source: 'webeditor' | 'nodeapi', 
    endpoint: string, 
    options: RequestInit = {},
    otherOptions: Partial<(typeof _otherOptions)> = _otherOptions,
) {
    const { useHost, timeout: timeoutMs } = { ..._otherOptions, ...otherOptions, };
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

        const circuitKey = backendKey(country, source);
        if (!(await acquireAttempt(circuitKey))) throw new NetworkUnavailableError(source);

        let settled = false;
        const settle = (ok: boolean) => {
            if (settled) return;
            settled = true;
            if (ok) recordSuccess(circuitKey); else recordFailure(circuitKey);
        };

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), timeoutMs);

        try {
            const res = await fetch(url, {
                ...options,
                signal: controller.signal,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                    'x-api-key': config.api_key,
                },
            });
            settle(true);
            return res;
        } catch(err:any) {
            settle(false);
            if (err.name === 'AbortError') {
                throw new Error('Network request timed out. Check your connection and try again.');
            }
            throw err;
        } finally {
            clearTimeout(timeout);
            settle(false);
        }
    } catch(e) {
        throw tagErrorSource(e, source);
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
        const hospital = otherOptions.hospital || location?.hospital;

        if (!country) throw new Error('Location not set');

        const target = resolveLocalServer(country, hospital);
        if(target){

        let api_endpoint =  target.host;
        api_endpoint[api_endpoint.length - 1] === '/' ?
            api_endpoint.substring(0, api_endpoint.length - 1) : api_endpoint;

        endpoint = endpoint[0] === '/' ? endpoint.substring(1) : endpoint;
        url = [api_endpoint, endpoint].join('/');

        const sec = target.secret;
        const body = encryptInReactNative(options.body, sec);

        const circuitKey = backendKey(country, 'local', hospital);
        if (!(await acquireAttempt(circuitKey))) throw new NetworkUnavailableError('local');

        let settled = false;
        const settle = (ok: boolean) => {
            if (settled) return;
            settled = true;
            if (ok) recordSuccess(circuitKey); else recordFailure(circuitKey);
        };

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), LOCAL_TIMEOUT_MS);

        let res;
        try {
            res = await fetch(url, {
                method:'POST',
                body: JSON.stringify({data:body}),
                signal: controller.signal,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                    'x-api-key': target.api_key,
                }
            });
            settle(true);
        } catch (err: any) {
            settle(false);
            if (err.name === 'AbortError') {
                throw new Error('Local Server Connection Taking Longer Than The Expected 30 Seconds. Check With The Administrator if it is up!!');
            }
            throw err;
        } finally {
            clearTimeout(timeout);
            settle(false);
        }

        if (res.status !== 200) {
            logError('api.localRequestFailed', 'Local server returned a non-200 response', { url, status: res.status }, 'local');
        }

        return res;
    }
    return null
    } catch(e) {
        throw tagErrorSource(e, 'local'); }
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

        const queryString = endpoint.split('?')[1];
        const params = new URLSearchParams(queryString);
        const hospitalId = params.get("hospital");

        const target = resolveLocalServer(country, hospitalId);
        if(!target){
            return null
        }
        else{
        let api_endpoint =  target.host;
        api_endpoint[api_endpoint.length - 1] === '/' ?
            api_endpoint.substring(0, api_endpoint.length - 1) : api_endpoint;

        endpoint = endpoint[0] === '/' ? endpoint.substring(1) : endpoint;
        url = [api_endpoint, endpoint].join('/');

        const sec = target.secret;

        const circuitKey = backendKey(country, 'local', hospitalId);
        if (!(await acquireAttempt(circuitKey))) throw new NetworkUnavailableError('local');

        let settled = false;
        const settle = (ok: boolean) => {
            if (settled) return;
            settled = true;
            if (ok) recordSuccess(circuitKey); else recordFailure(circuitKey);
        };

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), LOCAL_TIMEOUT_MS);

        let res;
        try {
            res = await fetch(url, {
                method:'GET',
                signal: controller.signal,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                    'x-api-key': target.api_key,
                }
            });
            settle(true);
        } catch (err: any) {
            settle(false);
            if (err.name === 'AbortError') {
                throw new Error('Local Server Connection Taking Longer Than The Expected 30 Seconds. Check With The Administrator if it is up!!');
            }
            throw err;
        } finally {
            clearTimeout(timeout);
            settle(false);
        }

        if (res.status !== 200) {
            logError('api.localSessionsRequestFailed', 'Local server returned a non-200 response', { url, status: res.status }, 'local');
        }

        const sessions = decryptInReactNative(await res?.json(), sec);
        return sessions;
    }
   
    } catch(e) {
        throw tagErrorSource(e, 'local'); }
}

export async function hasLocalServerConfig() {
    try {
        const location = await getLocation();
        if (!location?.country) return false;
        return Boolean(resolveLocalServer(location.country, location.hospital));
    } catch {
        return false;
    }
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
    if (!encryptedData) return null;

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
    logError('api.decryptInReactNative', error);
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
