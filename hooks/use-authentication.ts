import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { DataResponse } from '@/types';
import { BEARER_TOKEN } from '@/constants/async-storage';
import logger from '@/lib/logger';

const defaultAuthenticationInfo: DataResponse<{ authenticated: boolean; }> = {
    data: { 
        authenticated: false, 
    }, 
};

export function useAuthentication() {
    const [info, setInfo] = useState<typeof defaultAuthenticationInfo>(defaultAuthenticationInfo);
    const [authInfoLoaded, setAuthInfoLoaded] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const bearerToken = await AsyncStorage.getItem(BEARER_TOKEN);
                setInfo({ 
                    data: {
                        authenticated: !!bearerToken,
                    }, 
                });
            } catch(e: any) {
                logger.error('getAuthenticationInfo ERROR', e.message);
                setInfo({ 
                    ...defaultAuthenticationInfo,
                    errors: [e.message], 
                });
            } finally {
                setAuthInfoLoaded(true);
            }
        })();
    }, []);

    return {
        ...info.data,
        loadAuthInfoErrors: info.errors,
        authInfoLoaded,
    };
}