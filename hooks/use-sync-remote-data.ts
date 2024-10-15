import { useState, useEffect, useCallback } from 'react';

import { syncRemoteData } from '@/data/sync-remote-data';

export function useSyncRemoteData(options?: {
    syncOnmount?: boolean;
}) {
    const {  syncOnmount} = { ...options };

    const [remotedSyncing, setSyncing] = useState(false);
    const [remotedSynced, setSynced] = useState(false);
    const [syncRemoteErrors, setSyncRemoteErrors] = useState<string[]>();

    const sync = useCallback(async () => {
        try {
            setSyncing(true);

            await syncRemoteData();
        } catch(e: any) {
            setSyncRemoteErrors([e.message]);
        } finally {
            setSyncing(false);
            setSynced(true);
        }
    }, []);

    useEffect(() => { if (syncOnmount) sync(); }, [syncOnmount]);

    return {
        sync,
        remotedSyncing,
        remotedSynced,
        syncRemoteErrors,
    };
}