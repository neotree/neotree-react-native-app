import { useMemo } from 'react';
import { useNetInfo as _useNetInfo } from '@react-native-community/netinfo';

export function useNetInfo() {
    const netInfo = _useNetInfo();

    const hasInternet = useMemo(() => !!(netInfo.isConnected && netInfo.isInternetReachable), [
        netInfo.isConnected,
        netInfo.isInternetReachable,
    ]);

    return {
        netInfo,
        hasInternet,
    };
}