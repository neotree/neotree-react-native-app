import React from 'react';
import { StatusBar } from 'expo-status-bar';
import registerdAssets from './assets';
import { Authentication } from './Authentication';
import { HomeNavigator } from './Home';
import { syncData, addSocketEventsListeners } from './data';
import { useAppContext } from './AppContext';
import { Splash } from './components';
import { SyncStatus } from './components/sync-status';
import { checkForOtaUpdateAndRecord, ensureApkDownloaded, getUpdateDecision } from './update';

export const assets = Object.values(registerdAssets);

export * from './data';
export * from './AppContext';
export * from './types';
export * from './components';
export * from './update';

export function Navigation() {
    const [ready, setReady] = React.useState(false);
    const {setSyncDataResponse, setUpdateDecision, authenticatedUser} = useAppContext()||{};

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
      

    if (!ready) return <Splash />;

    return (
        <>
            <StatusBar style="dark" />
            {!authenticatedUser ? <Authentication /> : <HomeNavigator />}
            <SyncStatus />
        </>
    );
}
