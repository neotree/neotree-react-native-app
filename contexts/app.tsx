import { createContext, useContext } from 'react';

import { useAppInit } from '@/hooks/use-app-init';

export interface IAppContext extends
    ReturnType<typeof useAppInit> {

    }

export const AppContext = createContext<IAppContext>(null!);

export const useAppContext = () => useContext(AppContext);

type AppContextProviderProps = ReturnType<typeof useAppInit> & {
    children: React.ReactNode;
};

export function AppContextProvider({ children, ...props }: AppContextProviderProps) {
    return (
        <AppContext.Provider
            value={{
                ...props
            }}
        >
            {children}
        </AppContext.Provider>
    );
}
