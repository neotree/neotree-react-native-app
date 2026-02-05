import React from 'react';
import { Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import NetInfo from '@react-native-community/netinfo';
import * as Updates from 'expo-updates';
import registerdAssets from './assets';
import { Authentication } from './Authentication';
import { HomeNavigator } from './Home';
import { syncData, addSocketEventsListeners } from './data';
import { useAppContext } from './AppContext';
import { Splash } from './components';
import { SyncStatus } from './components/sync-status';
import { checkForOtaUpdateAndRecord, checkForOtaUpdateFetchAndRecord, ensureApkDownloaded, getUpdateDecision } from './update';

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

    const initialiseApp = React.useCallback(async () => {
        try { 
            const res = await syncData(); 
            if(setSyncDataResponse)          
                setSyncDataResponse(res);
            if (setUpdateDecision) {
                const decision = await getUpdateDecision();
                setUpdateDecision(decision);
                if (decision?.shouldAutoDownload) {
                    await ensureApkDownloaded(decision);
                }
            }
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
        if (otaPrompted.current) return;
        otaPrompted.current = true;
        Alert.alert(
            'Update available',
            'A new update is ready. Restart the app to apply it?',
            [
                { text: 'Later', style: 'cancel' },
                {
                    text: 'Restart now',
                    onPress: () => {
                        Updates.reloadAsync().catch(() => null);
                    },
                },
            ],
        );
    }, []);

    const checkOtaWithPrompt = React.useCallback(async () => {
        const res = await checkForOtaUpdateFetchAndRecord();
        if (res.status === 'update_downloaded') {
            promptForOtaUpdate();
        }
    }, [promptForOtaUpdate]);

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
      

    if (!ready) return <Splash />;

    return (
        <>
            <StatusBar style="dark" />
            {!authenticatedUser ? <Authentication /> : <HomeNavigator />}
            <SyncStatus />
        </>
    );
}
