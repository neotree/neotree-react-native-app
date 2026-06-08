import React from 'react';
import { Alert, AppState } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Updates from 'expo-updates';
import registerdAssets from './assets';
import { Authentication } from './Authentication';
import { HomeNavigator } from './Home';
import { syncData, addSocketEventsListeners } from './data';
import { useAppContext } from './AppContext';
import { Splash } from './components';
import { SyncStatus } from './components/sync-status';
import {
    attemptAutoInstallIfDeferred,
    attemptAutoRetryDownload,
    checkForOtaUpdateAndRecord,
    checkForOtaUpdateFetchAndRecord,
    ensureApkDownloaded,
    flushOtaEvents,
    getUpdateDecision,
} from './update';
import { ASYNC_STORAGE_KEYS } from './constants/async-storage';
import { reportAppStateIfChanged } from './data/appState';

export const assets = Object.values(registerdAssets);

export * from './data';
export * from './AppContext';
export * from './types';
export * from './components';
export * from './update';

export function Navigation() {
    const [ready, setReady] = React.useState(false);
    const {setSyncDataResponse, setUpdateDecision, authenticatedUser} = useAppContext()||{};
    const otaPrompted = React.useRef(false);
    const lastOnline = React.useRef<boolean | null>(null);

    const isSessionActive = React.useCallback(async () => {
        const v = await AsyncStorage.getItem(ASYNC_STORAGE_KEYS.SESSION_ACTIVE);
        return v === 'true';
    }, []);

    const setOtaPending = React.useCallback(async (pending: boolean) => {
        if (pending) {
            await AsyncStorage.setItem(ASYNC_STORAGE_KEYS.OTA_RESTART_PENDING, 'true');
        } else {
            await AsyncStorage.removeItem(ASYNC_STORAGE_KEYS.OTA_RESTART_PENDING);
        }
    }, []);

    const hasOtaPending = React.useCallback(async () => {
        const v = await AsyncStorage.getItem(ASYNC_STORAGE_KEYS.OTA_RESTART_PENDING);
        return v === 'true';
    }, []);

    const initialiseApp = React.useCallback(async () => {
        try { 
            const res = await syncData(); 
            if(setSyncDataResponse)          
                setSyncDataResponse(res);
            if (setUpdateDecision) {
                const decision = await getUpdateDecision();
                setUpdateDecision(decision);
                await attemptAutoInstallIfDeferred();
                attemptAutoRetryDownload(decision).catch(() => null);
                if (decision?.shouldAutoDownload) {
                    ensureApkDownloaded(decision).catch(() => null);
                }
            }
            await Promise.all([
                reportAppStateIfChanged(),
                flushOtaEvents(),
            ]);
        } catch (e) {
            console.log(e);
        } finally {
            setReady(true);
        } 
    }, [setSyncDataResponse, setUpdateDecision]);

    React.useEffect(() => { if (!ready) initialiseApp(); }, [ready]);

    React.useEffect(() => { 
        
        addSocketEventsListeners(initialiseApp)
    
      
        ; }, []);

    React.useEffect(() => {
        checkForOtaUpdateAndRecord();
    }, []);

    const promptForOtaUpdate = React.useCallback(() => {
        (async () => {
            if (otaPrompted.current) return;
            if (await isSessionActive()) {
                await setOtaPending(true);
                return;
            }
            otaPrompted.current = true;
            Alert.alert(
                'Update available',
                'A new update is ready. Restart the app to apply it?',
                [
                    { 
                        text: 'Later', 
                        style: 'cancel',
                        onPress: () => {
                            setOtaPending(true).catch(() => null);
                        },
                    },
                    {
                        text: 'Restart now',
                        onPress: () => {
                            setOtaPending(false).catch(() => null);
                            Updates.reloadAsync().catch(() => null);
                        },
                    },
                ],
            );
        })();
    }, [isSessionActive, setOtaPending]);

    const checkOtaWithPrompt = React.useCallback(async () => {
        const res = await checkForOtaUpdateFetchAndRecord();
        if (res.status === 'update_downloaded') {
            promptForOtaUpdate();
        }
    }, [promptForOtaUpdate]);

    const promptIfPending = React.useCallback(async () => {
        const pending = await hasOtaPending();
        if (!pending) return;
        if (await isSessionActive()) return;
        otaPrompted.current = false;
        await setOtaPending(false);
        promptForOtaUpdate();
    }, [hasOtaPending, isSessionActive, promptForOtaUpdate, setOtaPending]);

    React.useEffect(() => {
        checkOtaWithPrompt();
        const unsubscribe = NetInfo.addEventListener((state) => {
            const online = Boolean(state?.isConnected) && state?.isInternetReachable !== false;
            if (lastOnline.current === null) {
                lastOnline.current = online;
                return;
            }
            if (!lastOnline.current && online) {
                checkOtaWithPrompt();
            }
            lastOnline.current = online;
        });
        return () => unsubscribe();
    }, [checkOtaWithPrompt]);

    React.useEffect(() => {
        const subscription = AppState.addEventListener('change', (state) => {
            if (state === 'active') {
                promptIfPending();
                reportAppStateIfChanged().catch(() => null);
                flushOtaEvents().catch(() => null);
            }
        });
        promptIfPending();
        return () => subscription.remove();
    }, [promptIfPending]);
      

    if (!ready) return <Splash />;

    return (
        <>
            <StatusBar style="dark" />
            {!authenticatedUser ? <Authentication /> : <HomeNavigator />}
            <SyncStatus />
        </>
    );
}
