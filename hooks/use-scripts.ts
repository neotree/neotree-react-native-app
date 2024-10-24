import { create } from "zustand";

import { GetScriptsOptions, ScriptListItem } from "@/types";
import { listScripts } from '@/data/queries/scripts';

type ScriptsState = {
    listLoading: boolean;
    listInitialised: boolean;
    listErrors: string[];
    list: ScriptListItem[];
};

type ScriptsStore = ScriptsState & {
    reset: () => void;
    getList: (options?: (GetScriptsOptions & { silent?: boolean; })) => Promise<void>;
};

const defaultScriptsState: ScriptsState = {
    listLoading: false,
    listInitialised: false,
    listErrors: [],
    list: [],
};

export const useScripts = create<ScriptsStore>(set => {
    return {
        ...defaultScriptsState,
        reset: () => set(defaultScriptsState),
        async getList(options) {
            try {
                const { silent, ...opts } = { ...options };
                set({ listLoading: !silent, });
                const res = await listScripts(opts);
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
