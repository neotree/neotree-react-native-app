import React from 'react';
import { StatusBar } from 'expo-status-bar';
import registerdAssets from './assets';
import { Authentication } from './Authentication';
import { HomeNavigator } from './Home';
import { api } from './data';
import { useAppContext } from './AppContext';
import { Splash } from './components';

export const assets = Object.values(registerdAssets);

export * from './data';
export * from './AppContext';
export * from './types';
export * from './components';

export function Navigation() {
    const [ready, setReady] = React.useState(false);
    const ctx = useAppContext();

    const initialiseApp = React.useCallback(async () => {
        try {
            const res = await api.syncData();            
            ctx?.setSyncDataResponse(res);
        } catch (e) {
            console.log(e);
        } finally {
            setReady(true);
        } 
    }, [ctx]);

    React.useEffect(() => { if (!ready) initialiseApp(); }, [ready]);

    React.useEffect(() => { api.addSocketEventsListeners(initialiseApp); }, []);

    if (!ready) return <Splash />;

    return (
        <>
            <StatusBar style="dark" />
            {!ctx?.authenticatedUser ? <Authentication /> : <HomeNavigator />}
        </>
    );
}
