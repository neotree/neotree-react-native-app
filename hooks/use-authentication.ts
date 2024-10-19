import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { DataResponse } from '@/types';
import { asyncStorageKeys } from '@/constants';
import logger from '@/lib/logger';
import { useHospitals } from './use-hospitals';

const defaultAuthenticationInfo: DataResponse<{ authenticated: boolean; }> = {
    data: { 
        authenticated: false, 
    }, 
};

export function useAuthentication() {
    const [info, setInfo] = useState<typeof defaultAuthenticationInfo>(defaultAuthenticationInfo);
    const [authInfoLoaded, setAuthInfoLoaded] = useState(false);

    const hospitals = useHospitals({ loadHospitalsOnmount: true, });

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
       ...hospitals,
        loadAuthInfoErrors: info.errors,
        authInfoLoaded,
        getAuthenticationInfo,
    };
}