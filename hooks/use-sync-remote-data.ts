import { create } from 'zustand';

import { syncRemoteData } from '@/data/sync-remote-data';

type SyncRemoteDataState = {
    remoteSyncQueue: number;
    remoteSyncing: boolean;
    remoteSynced: boolean;
    syncRemoteErrors: string[];
};

type SyncRemoteDataStore = SyncRemoteDataState & {
    sync: () => Promise<void>;
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
        async sync() {
            if (getStore().remoteSyncing) {
                set(prev => ({ remoteSyncQueue: prev.remoteSyncQueue + 1, }));
            } else {
                const syncRemoteErrors: string[] = [];
                try {
                    set({ remoteSyncing: true, remoteSyncQueue: 0, });
                    await syncRemoteData();
                } catch(e: any) {
                    syncRemoteErrors.push(e.message);
                } finally {
                    set({ remoteSyncing: false, remoteSynced: true, syncRemoteErrors, });
                }
            }
        }
    };
});