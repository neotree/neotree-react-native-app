import React from 'react';
import { StatusBar } from 'expo-status-bar';
import registerdAssets from './assets';
import { Authentication } from './Authentication';
import { HomeNavigator } from './Home';
import { initialiseData } from './data';
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

    React.useEffect(() => {
        (async () => {
            if (!ready) {
                try {
                    const res = await initialiseData();            
                    ctx?.setAuthenticatedUser(res?.authenticatedUser);
                    ctx?.setApplication(res?.application);
                } catch (e) {
                    console.log(e);
                } finally {
                    setReady(true);
                }     
            }   
        })();
    }, [ready]);

    if (!ready) return <Splash />;

    return (
        <>
            <StatusBar style="dark" />
            {!ctx?.authenticatedUser ? <Authentication /> : <HomeNavigator />}
        </>
    );
}
