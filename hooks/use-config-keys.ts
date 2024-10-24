import { create } from "zustand";

import { GetConfigKeysOptions, ConfigKeyListItem } from "@/types";
import { listConfigKeys } from '@/data/queries/config-keys';

type ConfigKeysState = {
    listLoading: boolean;
    listInitialised: boolean;
    listErrors: string[];
    list: ConfigKeyListItem[];
};

type ConfigKeysStore = ConfigKeysState & {
    reset: () => void;
    getList: (options?: (GetConfigKeysOptions & { silent?: boolean; })) => Promise<void>;
};

const defaultConfigKeysState: ConfigKeysState = {
    listLoading: false,
    listInitialised: false,
    listErrors: [],
    list: [],
};

export const useConfigKeys = create<ConfigKeysStore>(set => {
    return {
        ...defaultConfigKeysState,
        reset: () => set(defaultConfigKeysState),
        async getList(options) {
            try {
                const { silent, ...opts } = { ...options };
                set({ listLoading: !silent, });
                const res = await listConfigKeys(opts);
                set({
                    listErrors: res.errors || [],
                    list: res.data,
                });
            } catch(e: any) {
                set({ listErrors: [e.message], });
            } finally {
                set({ listLoading: false, listInitialised: true, });
            }
        },
    };
});
