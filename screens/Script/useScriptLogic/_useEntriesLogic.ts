import { Screen } from '@/api';
import React from 'react';
import { ApiData, Entry } from '../types';

type UseEntriesParams = { 
    apiData: ApiData, 
    activeScreen: Screen, 
    screen_id: string | number; 
};

export function useEntriesLogic({ apiData }: UseEntriesParams) {
    const [entries, setEntries] = React.useState<Entry[]>([]);
    const [cachedEntries, setCachedEntries] = React.useState<Entry[]>([]);

    const setEntry = (entry: Entry) => {

    };

    const setCachedEntry = (entry: Entry) => {

    };

    return {
        entries,
        cachedEntries,
        setEntry,
        setCachedEntry,
    };
}
