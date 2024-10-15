import { createContext, useContext } from 'react';

import { useHospitals } from '@/hooks/use-hospitals';
import { useSites } from '@/hooks/use-sites';

export interface IAuthContext extends
    ReturnType<typeof useHospitals> {

    }

export const AuthContext = createContext<IAuthContext>(null!);

export const useAuthContext = () => useContext(AuthContext);

type AuthContextProviderProps = {
    children: React.ReactNode;
};

export function AuthContextProvider({ children }: AuthContextProviderProps) {
    const hospitals = useHospitals();
    const { sites } = useSites();

    console.log('sites found: ', sites.length);

    return (
        <AuthContext.Provider
            value={{
                ...hospitals,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
