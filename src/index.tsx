import React from 'react';
import { StatusBar } from 'expo-status-bar';
import registerdAssets from './assets';
import { Authentication } from './Authentication';
import { HomeNavigator } from './Home';
import { syncData, addSocketEventsListeners } from './data';
import { useAppContext } from './AppContext';
import { Splash } from './components';

export const assets = Object.values(registerdAssets);

export * from './data';
export * from './AppContext';
export * from './types';
export * from './components';

export function Navigation() {
    const [ready, setReady] = React.useState(false);
    const {setSyncDataResponse,authenticatedUser} = useAppContext()||{};

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

    React.useEffect(() => { if (!ready) initialiseApp(); }, [ready]);

    React.useEffect(() => { 
        
        addSocketEventsListeners(initialiseApp)
    
      
        ; }, []);
      

    if (!ready) return <Splash />;

    return (
        <>
            <StatusBar style="dark" />
            {!authenticatedUser ? <Authentication /> : <HomeNavigator />}
        </>
    );
}
