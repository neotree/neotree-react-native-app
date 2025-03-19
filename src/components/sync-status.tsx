import { useCallback, useEffect, useState } from "react";
import { ToastAndroid, TouchableOpacity } from "react-native";
import Icon from '@expo/vector-icons/MaterialIcons';
import AsyncStorage from "@react-native-async-storage/async-storage";

import { Box, Text, useTheme } from '@/src/components';
import { ASYNC_STORAGE_KEYS } from "@/src/constants/async-storage";
import * as api from '@/src/data';

export function SyncStatus() {
    const theme = useTheme();
    const [error, setError] = useState('');

    const init = useCallback(async () => {
        try {
            const error = await AsyncStorage.getItem(ASYNC_STORAGE_KEYS.SYNC_ERROR);
            if (error) setError(error);
        } catch(e: any) {
            // do nothing
        }
    }, []);

    const dismiss = useCallback(() => {
        setError('');
        AsyncStorage.removeItem(ASYNC_STORAGE_KEYS.SYNC_ERROR);
    }, []);

    const sync = useCallback(async () => {
        try {
            ToastAndroid.show('syncing...', ToastAndroid.SHORT);
            dismiss();
            await api.syncData();
        } finally {
            init();
        }
    }, [dismiss, init]);

    useEffect(() => { init(); }, [init]);

    if (!error) return null;

    return (
        <>
            <Box
                bg="error"
                columnGap="l"
                flexDirection="row"
                justifyContent="center"
                alignItems="center"
                style={{ padding: 2, }}
            >
                <Text
                    variant="caption"
                    color="errorContrastText"
                    opacity={.8}
                >
                    {error}
                </Text>

                <TouchableOpacity onPress={sync}>
                    <Icon 
                        name="refresh"
                        size={16}
                        color={theme.colors.errorContrastText}
                    />
                </TouchableOpacity>

                <TouchableOpacity onPress={dismiss}>
                    <Text
                        variant="caption"
                        color="errorContrastText"
                        textTransform="uppercase"
                        fontWeight="bold"
                    >
                        Dismiss
                    </Text>
                </TouchableOpacity>
            </Box>
        </>
    );
}
