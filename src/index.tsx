import React from 'react';
import { ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import registerdAssets from './assets';
import { Authentication } from './Authentication';
import { HomeNavigator } from './Home';
import { syncData, ensureSchema, getApplication, getAuthenticatedUser, addSocketEventsListeners, registerExportOnReconnect } from './data';
import { useAppContext } from './AppContext';
import { Box, Br, Button, Splash, Text, useTheme } from './components';
import { SyncStatus } from './components/sync-status';
import { logError } from '@/src/utils/logError';

export const assets = Object.values(registerdAssets);

export * from './data';
export * from './AppContext';
export * from './types';
export * from './components';

function InitialSync({ syncing, retry }: { syncing: boolean; retry: () => void }) {
    const theme = useTheme();

    return (
        <Box flex={1} padding="xl" justifyContent="center" alignItems="center">
            <Text variant="title3" textAlign="center">Setting up the app</Text>
            <Br spacing="m" />
            <Text textAlign="center" color="textSecondary">
                {syncing
                    ? 'Downloading the data needed to use the app...'
                    : 'Setup needs a connection to the server. Your sign-in is saved; connect and try again.'}
            </Text>
            <Br spacing="l" />
            {syncing
                ? <ActivityIndicator color={theme.colors.primary} size="large" />
                : <Button onPress={retry}>Try again</Button>}
        </Box>
    );
}

export function Navigation() {
    const [ready, setReady] = React.useState(false);
    const [initialSyncing, setInitialSyncing] = React.useState(false);
    const {setSyncDataResponse,authenticatedUser,application,locationVersion} = useAppContext()||{};

    const readyRef = React.useRef(false);

    const initialiseApp = React.useCallback(async () => {
        try {
            // Restore the local session before attempting a network request.
            // Cached data can open Home immediately; without it, show setup and
            // retain the session while the first download is retried.
            if (!readyRef.current) {
                try {
                    await ensureSchema();
                    const [user, app] = await Promise.all([getAuthenticatedUser(), getApplication()]);
                    // Restore the saved session even when the first dataset has
                    // not downloaded yet. A failed sync must not send this user
                    // back to the sign-in screen.
                    setSyncDataResponse?.({ authenticatedUser: user, application: app, last_sync_date: app?.last_sync_date } as any);
                    if (app?.webeditor_info?.version) {
                        readyRef.current = true;
                        setReady(true);
                        syncData()
                            .then(res => setSyncDataResponse?.(res))
                            .catch(e => logError('App.backgroundSync', e));
                        return;
                    }
                    readyRef.current = true;
                    setReady(true);
                } catch (e) {
                    logError('App.localStart', e);
                }
            }

            setInitialSyncing(true);
            const res = await syncData();
            if(setSyncDataResponse)
                setSyncDataResponse(res);
        } catch (e) {
            logError('App.initialise', e);
        } finally {
            setInitialSyncing(false);
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
            {!authenticatedUser
                ? <Authentication />
                : application?.webeditor_info?.version
                    ? <HomeNavigator />
                    : <InitialSync syncing={initialSyncing} retry={initialiseApp} />}
            {authenticatedUser && application?.webeditor_info?.version && <SyncStatus />}
        </>
    );
}
