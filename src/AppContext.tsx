import React from 'react';
import * as types from './types';
import * as api from './data';
import { UpdateDecision } from './update/orchestrator';

export interface IAppContext {
    authenticatedUser: types.AuthenticatedUser | null;
    application: types.Application | null;
    setAuthenticatedUser: React.Dispatch<React.SetStateAction<types.AuthenticatedUser | null>>;    
    setApplication: React.Dispatch<React.SetStateAction<types.Application | null>>;
    setSyncDataResponse: (res: Awaited<ReturnType<typeof api.syncData>>) => void;
    updateDecision: UpdateDecision | null;
    setUpdateDecision: React.Dispatch<React.SetStateAction<UpdateDecision | null>>;
}

export const AppContext = React.createContext<IAppContext>(null!);

export const useAppContext = () => React.useContext(AppContext);

export function AppContextProvider({ children }: React.PropsWithChildren<{}>) {
    const [authenticatedUser, setAuthenticatedUser] = React.useState<types.AuthenticatedUser | null>(null);
    const [application, setApplication] = React.useState<types.Application | null>(null);
    const [updateDecision, setUpdateDecision] = React.useState<UpdateDecision | null>(null);

    return (
        <AppContext.Provider 
            value={{
                authenticatedUser,
                application,
                setAuthenticatedUser,
                setApplication,
                updateDecision,
                setUpdateDecision,
                setSyncDataResponse: res => {
                    setAuthenticatedUser(res?.authenticatedUser);
                    setApplication(res?.application);
                },
            }}
        >
            {children}
        </AppContext.Provider>
    )
}
