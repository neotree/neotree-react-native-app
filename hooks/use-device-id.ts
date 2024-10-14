import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { getDeviceID } from '@/lib/device';
import { asyncStorageKeys } from '@/constants';
import logger from '@/lib/logger';

export function useDeviceId() {
    const [deviceId, setDeviceId] = useState('');
    const [loadDeviceIdError, setError] = useState<string>();
    const [deviceIdLoaded, setDeviceIdLoaded] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                let deviceId = await AsyncStorage.getItem(asyncStorageKeys.DEVICE_ID);
                if (!deviceId) deviceId = await getDeviceID();

                if (!deviceId) throw new Error('Failed to get deviceId');

                await AsyncStorage.setItem(asyncStorageKeys.DEVICE_ID, deviceId);

                setDeviceId(deviceId);
            } catch(e: any) {
                logger.log('getDeviceId ERROR', e.message);
                setError(e.message);
            } finally {
                setDeviceIdLoaded(true)
            }
        })();
    }, []);

    return {
        deviceId,
        deviceIdLoaded,
        loadDeviceIdErrors: loadDeviceIdError ? [loadDeviceIdError] : undefined,
    };
}