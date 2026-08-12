import React from 'react';
import { StatusBar } from 'expo-status-bar';
import registerdAssets from './assets';
import { Authentication } from './Authentication';
import { HomeNavigator } from './Home';
import { syncData, addSocketEventsListeners, registerExportOnReconnect } from './data';
import { useAppContext } from './AppContext';
import { Splash } from './components';
import { SyncStatus } from './components/sync-status';

export const assets = Object.values(registerdAssets);

export * from './data';
export * from './AppContext';
export * from './types';
export * from './components';

export function Navigation() {
    const [ready, setReady] = React.useState(false);
    const {setSyncDataResponse,authenticatedUser,locationVersion} = useAppContext()||{};

    const initialiseApp = React.useCallback(async () => {
        try {
            const res = await syncData();
            if(setSyncDataResponse)
                setSyncDataResponse(res);
        } catch (e) {
            console.log(e);
        } finally {
            setReady(true);
        }
    }, [setSyncDataResponse]);

    React.useEffect(() => { if (!ready) initialiseApp(); }, [ready, initialiseApp]);

    // Registered once: NetInfo transitions and circuit resets aren't tied to location.
    React.useEffect(() => {
        if (!ready) return;
        const unsubscribe = registerExportOnReconnect();
        return unsubscribe;
    }, [ready]);

    React.useEffect(() => {
        let cancelled = false;
        let cleanup: (() => void) | undefined;

        addSocketEventsListeners(initialiseApp).then(unsubscribe => {
            if (cancelled) { unsubscribe(); return; }
            cleanup = unsubscribe;
        });

        return () => {
            cancelled = true;
            cleanup?.();
        };
    }, [locationVersion, initialiseApp]);

    if (!ready) return <Splash />;

    return (
        <>
            <StatusBar style="dark" />
            {!authenticatedUser ? <Authentication /> : <HomeNavigator />}
            <SyncStatus />
        </>
    );
}
