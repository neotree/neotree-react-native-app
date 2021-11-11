import { Screen } from '@/api';
import React from 'react';
import { ApiData, AutoFill, Entry, UseEntriesLogic } from '../types';

type UseEntriesParams = { 
    apiData: ApiData, 
    activeScreen: Screen, 
    screen_id: string | number; 
    script_id: string | number; 
};

export function useEntriesLogic({ 
    apiData,
    script_id, 
    screen_id,
}: UseEntriesParams): UseEntriesLogic {
    const [screensWithNoAutoFill, _setScreensWithNoAutoFill] = React.useState({});
    const setScreensWithNoAutoFill = s => _setScreensWithNoAutoFill(prev => ({ ...prev, ...s }));

    const [entries, setEntries] = React.useState<Entry[]>([]);
    const [cachedEntries, setCachedEntries] = React.useState<Entry[]>([]);
    const [autoFill, setAutoFill] = React.useState<AutoFill>({ uid: null, session: null });

    React.useEffect(() => {
        setEntries([]);
        setCachedEntries([]);
    }, [script_id]);

    const setCachedEntry = entry => !entry ? null : setCachedEntries(entries => {
        const isAlreadyEntered = entries.map(e => e.screen.id).includes(entry.screen.id);
        return isAlreadyEntered ? entries.map(e => e.screen.id === entry.screen.id ? entry : e) : [...entries, entry];
    });

    const setEntry = entry => {
        if (entry) {
            setScreensWithNoAutoFill({ [entry.screen.id]: true });
            setEntries(entries => {
                const isAlreadyEntered = entries.map(e => e.screen.id).includes(entry.screen.id);
                return isAlreadyEntered ? entries.map(e => e.screen.id === entry.screen.id ? entry : e) : [...entries, entry];
            });
            setCachedEntry(entry);
        }
    };

    function removeEntry(screenId: string | number) {
        setCachedEntry(entries.filter(e => e.screen.id === screenId)[0]);
        setEntries(entries => entries.filter(e => e.screen.id !== screenId));
    }

    return {
        autoFill,
        setAutoFill,
        removeEntry,
        entries,
        cachedEntries,
        setEntry,
        setCachedEntry,
        screensWithNoAutoFill,
        activeScreenEntry: cachedEntries.filter(e => e?.screen?.id === screen_id)[0],
    };
}
