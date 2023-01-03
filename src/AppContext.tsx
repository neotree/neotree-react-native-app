import React from 'react';
import { AuthenticatedUser } from './types';

export interface IAppContext {
    authenticatedUser: AuthenticatedUser | null;
    setAuthenticatedUser: React.Dispatch<React.SetStateAction<AuthenticatedUser | null>>;
}

export const AppContext = React.createContext<IAppContext | null>(null);

export const useAppContext = () => React.useContext(AppContext);

export function AppContextProvider({ children }: React.PropsWithChildren<{}>) {
    const [authenticatedUser, setAuthenticatedUser] = React.useState(null);

    return (
        <AppContext.Provider 
            value={{
                authenticatedUser,
                setAuthenticatedUser,
            }}
        >
            {children}
        </AppContext.Provider>
    )
}
