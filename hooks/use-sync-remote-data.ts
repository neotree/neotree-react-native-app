import { create } from 'zustand';

import { syncRemoteData } from '@/data/sync-remote-data';

type SyncRemoteDataState = {
    remoteSyncQueue: number;
    remoteSyncing: boolean;
    remoteSynced: boolean;
    syncRemoteErrors: string[];
};

type SyncRemoteDataStore = SyncRemoteDataState & {
    sync: (options?: Parameters<typeof syncRemoteData>[0]) => Promise<void>;
};

const defaultState: SyncRemoteDataState = {
    remoteSyncQueue: 0,
    remoteSyncing: false,
    remoteSynced: false,
    syncRemoteErrors: [],
};

export const useSyncRemoteData = create<SyncRemoteDataStore>((set, getStore) => {
    return {
        ...defaultState,
        async sync(options) {
            if (getStore().remoteSyncing) {
                set(prev => ({ remoteSyncQueue: prev.remoteSyncQueue + 1, }));
            } else {
                const syncRemoteErrors: string[] = [];
                try {
                    set({ remoteSyncing: true, remoteSyncQueue: 0, });
                    await syncRemoteData(options);
                } catch(e: any) {
                    syncRemoteErrors.push(e.message);
                } finally {
                    set({ remoteSyncing: false, remoteSynced: true, syncRemoteErrors, });
                }
            }
        }
    };
});