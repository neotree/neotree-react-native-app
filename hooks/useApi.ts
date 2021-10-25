import React from 'react';
import * as api from '@/api';

export type UseApi = [
    api.InitApiResults & {
        initialising: boolean;
        initialised: boolean;
    },
    () => void
];

export function useApi(): UseApi {
    const [initialising, setInitialising] = React.useState(true);
    const [initialised, setApiInitialised] = React.useState(false);
    const [initResults, setInitResults] = React.useState<api.InitApiResults | null>(null);

    const initApi = React.useCallback(() => {
        (async () => {
            setInitialising(true);
            try {
                const res = await api.init();
                setInitResults(res);
            } catch (e) { setInitResults({ error: e }); }

            setApiInitialised(true);
            setInitialising(false);
        })();
    }, []);

    React.useEffect(() => { initApi(); }, []);

    React.useEffect(() => {
        api.firebase.auth().onAuthStateChanged(user => {
            (async () => {
                if (!user && initResults?.authenticatedUser) {
                    await api.logOut();
                    initApi();
                }
            })();
        });
    }, [initResults]);

    return [{ initialised, initialising, ...initResults }, initApi];
}
