import AsyncStorage from '@react-native-async-storage/async-storage';

import { DataResponse } from '@/types';
import { BEARER_TOKEN } from '@/constants/async-storage';

export const defaultAuthenticationInfo: DataResponse<{ authenticated: boolean; }> = {
    data: { 
        authenticated: false, 
    }, 
};

export async function getAuthenticationInfo(): Promise<typeof defaultAuthenticationInfo> {
    try {
        const bearerToken = await AsyncStorage.getItem(BEARER_TOKEN);
        return { 
            data: {
                authenticated: !!bearerToken,
            }, 
        };
    } catch(e: any) {
        return { 
            ...defaultAuthenticationInfo,
            errors: [e.message], 
        };
    }
}