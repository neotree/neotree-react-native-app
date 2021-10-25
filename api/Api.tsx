/* global fetch */
import NetInfo from '@react-native-community/netinfo';
import queryString from 'query-string';
import { ENV } from '@/constants';
import { getLocation } from './_location';

export type MakeApiCallParams = RequestInit & {
  country?: string;
  body?: object;
};

type FetchError = string | { message?: string; msg?: string; };

type FetchRes<T> = T & {
  errors?: FetchError[];
  error: FetchError;
};

class Api<T = any> {
    private parseResponse;

    constructor(parseResponse: (res: Response) => Promise<T>) {
        this.parseResponse = parseResponse;
    }

    private makeApiCall<T>(endpoint, params: MakeApiCallParams = {}): Promise<T> {
        return new Promise((resolve, reject) => {
          const { country: _country, body, ...opts } = params;
      
          let url = '';
          let country = _country;
      
          (async () => {
            try {
              const networkState = await NetInfo.fetch();
              if (!networkState.isInternetReachable) throw new Error('No internet connection');
      
              if (!country) {
                const location = await getLocation();
                country = location.country;
              }
      
              const apiConfig = country ? ENV.countries.filter(c => c.country_code === country)[0]?.webeditor : null;
              if (!apiConfig) throw new Error(`Api config for ${country} not found`);
      
              url = `${apiConfig.api_endpoint}${endpoint}`;
              const reqOpts: RequestInit = {
                ...opts,
                headers: {
                  'Content-Type': 'application/json',
                  ...opts.headers,
                  'x-api-key': apiConfig.api_key,
                }
              };
              if (opts.method === 'GET') {
                url = `${url}?${queryString.stringify(body || {})}`;
              } else {
                reqOpts.headers['Content-Type'] = 'application/json';
                reqOpts.body = JSON.stringify({ ...body });
              }
              console.log(`makeApiCall [${reqOpts.method}]: ${url}`);
      
              let res = await (await fetch(url, reqOpts)).json() as FetchRes<T>;
      
              if (res.errors || res.error) throw new Error((res.error ? [res.error] : res.errors).map(e => typeof e === 'string' ? e : e.message || e.msg).join('\n'));
      
              resolve(res);
            } catch (e) { console.log(`makeApiCall ERROR: ${url}: `, e); reject(e); }
          })();
        });
    }

    get<T = any>(endpoint, params): Promise<T> { 
        return this.makeApiCall<T>(endpoint, { ...params, method: 'GET' }); 
    }
    
    post<T = any>(endpoint, params): Promise<T> { 
        return this.makeApiCall<T>(endpoint, { ...params, method: 'POST' }); 
    }
};

function getWebEditorApi<T>() {
    return new Api<T>(async function <T = any>(response: Response): Promise<T> { 
        const res = await response.json() as FetchRes<T>;
        if (res.errors || res.error) throw new Error((res.error ? [res.error] : res.errors).map(e => typeof e === 'string' ? e : e.message || e.msg).join('\n'));
        return res;
    });
}

export const webeditor = {
    get: function<T = any>(endpoint, params): Promise<T> { 
        const api = getWebEditorApi<T>();
        return api.get<T>(endpoint, { ...params, method: 'GET' }); 
    },

    post: function<T = any>(endpoint, params): Promise<T> { 
        const api = getWebEditorApi<T>();
        return api.post<T>(endpoint, { ...params, method: 'POST' }); 
    },
};
