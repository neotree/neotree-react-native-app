import { createContext, useCallback, useContext, useEffect, useState } from "react";

import { DEFAULT_API_CONFIG_COUNTRY } from '@/constants';
import { useDataMigrations } from "@/hooks/use-data-migrations";
import { useStorageState } from '@/hooks/use-storage-state';
import { getDeviceID } from "@/lib/get-device-id";

type AppContextType = ReturnType<typeof useAppCtxValue>;

const AppContext = createContext<AppContextType>(null!);

export {
	AppContextProvider,
	useAppContext,
	type AppContextType as AppContext
};

function useAppContext() {
	const ctx = useContext(AppContext);
	if (!ctx) throw new Error('useAppContext must be wrapped in a <AppContextProvider />');
	return ctx;
};

function AppContextProvider({ children }: {
	children: React.ReactNode;
}) {
	const ctx = useAppCtxValue();
	return (
		<AppContext.Provider value={ctx}>
			{children}
		</AppContext.Provider>
	);
}

function useAppCtxValue() {
	// initialise database
	const { loading: migrationsLoading, } = useDataMigrations();

	const [[deviceIdLoading, deviceId]] = useStorageState('deviceId', {
		initialValue: getDeviceID,
	});
	const [[countryLoading, country], setCountry] = useStorageState('country', {
		initialValue: DEFAULT_API_CONFIG_COUNTRY?.iso,
	});
	const [[hospitalLoading, hospital], setHospital] = useStorageState('hospital');

	/*******************************************************************
	**** AUTH
	********************************************************************/
	const [[authenticatedUserLoading, authenticatedUser], setAuthenticatedUser] = useStorageState('authenticatedUser');

	const signIn = useCallback(async () => {
		await new Promise(resolve => setTimeout(resolve, 1500));
		setAuthenticatedUser('xxx');
	}, []);

	const signOut = useCallback(async () => {
		await new Promise(resolve => setTimeout(resolve, 1500));
		setAuthenticatedUser(null);
	}, []);

	/*******************************************************************
	********************************************************************/
	const [initialised, setInitialised] = useState(false);

	useEffect(() => {
		const isInitialised = !(
			authenticatedUserLoading &&
			hospitalLoading &&
			countryLoading &&
			migrationsLoading &&
			deviceIdLoading
		);

		if (!initialised && isInitialised) {
			setTimeout(() => setInitialised(true), 0);
		}
	}, [
		initialised,
		authenticatedUserLoading,
		hospitalLoading,
		countryLoading,
		migrationsLoading,
		deviceIdLoading,
	]);

	return {
		deviceId,
		initialised,
		authenticatedUser,
		authenticatedUserLoading,
		hospitalLoading,
		hospital,
		country,
		countryLoading,
		signIn,
		signOut,
		setHospital,
		setCountry,
	};
}
