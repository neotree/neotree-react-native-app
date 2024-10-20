import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { asyncStorageKeys } from '@/constants';
import logger from '@/lib/logger';

const defaultAuthenticationInfo: { authenticated: boolean; errors?: string[]; } = {
    authenticated: false, 
};

export function useAuthentication() {
    const [info, setInfo] = useState<typeof defaultAuthenticationInfo>(defaultAuthenticationInfo);
    const [authInfoLoaded, setAuthInfoLoaded] = useState(false);

    const getAuthenticationInfo = useCallback(async () => {
        try {
            const bearerToken = await AsyncStorage.getItem(asyncStorageKeys.BEARER_TOKEN);
            setInfo({ 
                authenticated: !!bearerToken,
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
        ...info,
        loadAuthInfoErrors: info.errors,
        authInfoLoaded,
        getAuthenticationInfo,
    };
}