import React from 'react';
import * as types from './types';
import * as api from './data';

export interface IAppContext {
    authenticatedUser: types.AuthenticatedUser | null;
    application: types.Application | null;
    setAuthenticatedUser: React.Dispatch<React.SetStateAction<types.AuthenticatedUser | null>>;    
    setApplication: React.Dispatch<React.SetStateAction<types.Application | null>>;
    setSyncDataResponse: (res: Awaited<ReturnType<typeof api.syncData>>) => void;
    locationVersion: number;
    bumpLocationVersion: () => void;
}

export const AppContext = React.createContext<IAppContext>(null!);

export const useAppContext = () => React.useContext(AppContext);

export function AppContextProvider({ children }: React.PropsWithChildren<{}>) {
    const [authenticatedUser, setAuthenticatedUser] = React.useState<types.AuthenticatedUser | null>(null);
    const [application, setApplication] = React.useState<types.Application | null>(null);
    const [locationVersion, setLocationVersion] = React.useState(0);

    // Stable identities: Navigation builds its sync callback and socket
    // subscription from these, so new functions each render would restart the
    // startup sync and resubscribe on every provider update.
    const setSyncDataResponse = React.useCallback((res: Awaited<ReturnType<typeof api.syncData>>) => {
        setAuthenticatedUser(res?.authenticatedUser);
        setApplication(res?.application);
    }, []);
    const bumpLocationVersion = React.useCallback(() => setLocationVersion(v => v + 1), []);

    const value = React.useMemo(() => ({
        authenticatedUser,
        application,
        setAuthenticatedUser,
        setApplication,
        setSyncDataResponse,
        locationVersion,
        bumpLocationVersion,
    }), [authenticatedUser, application, setSyncDataResponse, locationVersion, bumpLocationVersion]);

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    )
}
