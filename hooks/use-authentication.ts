import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { DataResponse } from '@/types';
import { asyncStorageKeys } from '@/constants';
import logger from '@/lib/logger';

const defaultAuthenticationInfo: DataResponse<{ authenticated: boolean; }> = {
    data: { 
        authenticated: false, 
    }, 
};

export function useAuthentication() {
    const [info, setInfo] = useState<typeof defaultAuthenticationInfo>(defaultAuthenticationInfo);
    const [authInfoLoaded, setAuthInfoLoaded] = useState(false);

    const getAuthenticationInfo = useCallback(async () => {
        try {
            const bearerToken = await AsyncStorage.getItem(asyncStorageKeys.BEARER_TOKEN);
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
    }, []);

    useEffect(() => { getAuthenticationInfo(); }, []);

    return {
        ...info.data,
        loadAuthInfoErrors: info.errors,
        authInfoLoaded,
        getAuthenticationInfo,
    };
}