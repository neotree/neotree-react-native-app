import React from 'react';
import * as types from './types';

export interface IAppContext {
    authenticatedUser: types.AuthenticatedUser | null;
    application: types.Application | null;
    setAuthenticatedUser: React.Dispatch<React.SetStateAction<types.AuthenticatedUser | null>>;    
    setApplication: React.Dispatch<React.SetStateAction<types.Application | null>>;
}

export const AppContext = React.createContext<IAppContext | null>(null);

export const useAppContext = () => React.useContext(AppContext);

export function AppContextProvider({ children }: React.PropsWithChildren<{}>) {
    const [authenticatedUser, setAuthenticatedUser] = React.useState<types.AuthenticatedUser | null>(null);
    const [application, setApplication] = React.useState<types.Application | null>(null);

    return (
        <AppContext.Provider 
            value={{
                authenticatedUser,
                setAuthenticatedUser,
                application,
                setApplication
            }}
        >
            {children}
        </AppContext.Provider>
    )
}
