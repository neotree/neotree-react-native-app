import React from 'react';
import * as api from '@/api';
import { SocketEvent } from '@/api';

export type UseApi = [
    api.InitApiResults & {
        initialising: boolean;
        initialised: boolean;
        lastSocketEvent: SocketEvent;
    },
    () => void
];

export function useApi(): UseApi {
    const [initialising, setInitialising] = React.useState(true);
    const [initialised, setApiInitialised] = React.useState(false);
    const [initResults, setInitResults] = React.useState<api.InitApiResults | null>(null);
    const [lastSocketEvent, setLastSocketEvent] = React.useState<api.SocketEvent>(null);

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

    React.useEffect(() => {
        if (initResults?.location) {
            api.addSocketEventsListeners(initResults.location.country, e => setLastSocketEvent(e));
        }
    }, [initResults]);

    return [{ lastSocketEvent, initialised, initialising, ...initResults }, initApi];
}
