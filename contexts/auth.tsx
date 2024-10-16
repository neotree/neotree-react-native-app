import { createContext, useContext } from 'react';

import { useHospitals } from '@/hooks/use-hospitals';

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
