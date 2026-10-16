import React from 'react';
import { StatusBar } from 'expo-status-bar';
import registerdAssets from './assets';
import { Authentication } from './Authentication';
import { HomeNavigator } from './Home';
import { syncData, ensureSchema, getApplication, getAuthenticatedUser, addSocketEventsListeners, registerExportOnReconnect } from './data';
import { useAppContext } from './AppContext';
import { Splash } from './components';
import { SyncStatus } from './components/sync-status';
import { logError } from '@/src/utils/logError';

export const assets = Object.values(registerdAssets);

export * from './data';
export * from './AppContext';
export * from './types';
export * from './components';

export function Navigation() {
    const [ready, setReady] = React.useState(false);
    const {setSyncDataResponse,authenticatedUser,locationVersion} = useAppContext()||{};

    const readyRef = React.useRef(false);

    const initialiseApp = React.useCallback(async () => {
        try {
            // First launch only: if this device already holds a full copy of the
            // data, show the app from it straight away and let the sync run in the
            // background. Waiting on the network here left the splash up for as
            // long as the server took to answer (up to the 5 minute download
            // timeout). With nothing stored yet, the sync is the only source of
            // data, so it is still awaited.
            if (!readyRef.current) {
                try {
                    await ensureSchema();
                    const [user, app] = await Promise.all([getAuthenticatedUser(), getApplication()]);
                    if (app?.webeditor_info?.version) {
                        setSyncDataResponse?.({ authenticatedUser: user, application: app, last_sync_date: app.last_sync_date } as any);
                        readyRef.current = true;
                        setReady(true);
                        syncData()
                            .then(res => setSyncDataResponse?.(res))
                            .catch(e => logError('App.backgroundSync', e));
                        return;
                    }
                } catch (e) {
                    logError('App.localStart', e);
                }
            }

            const res = await syncData();
            if(setSyncDataResponse)
                setSyncDataResponse(res);
        } catch (e) {
            logError('App.initialise', e);
        } finally {
            readyRef.current = true;
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
