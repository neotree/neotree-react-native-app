import React from 'react';

export const defaultAppContextState = {};

export type IAppContextState = typeof defaultAppContextState;

export interface IAppContext {
    state: IAppContextState;
    setState: React.Dispatch<React.SetStateAction<IAppContextState>>;
}

export const AppContext = React.createContext<IAppContext | null>(null);

export const useAppContext = () => React.useContext(AppContext);

export function AppContextProvider({ children }: React.PropsWithChildren<{}>) {
    const [state, setState] = React.useState(defaultAppContextState);

    return (
        <AppContext.Provider 
            value={{
                state,
                setState,
            }}
        >
            {children}
        </AppContext.Provider>
    )
}
