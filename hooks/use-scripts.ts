import { create } from "zustand";

import { GetScriptsOptions, Script, ScriptListItem } from "@/types";
import { listScripts } from '@/data/queries/scripts';

type ScriptsState = {
    listLoading: boolean;
    listInitialised: boolean;
    listErrors: string[];
    list: ScriptListItem[];
    scriptsLoading: boolean;
    scriptsInitialised: boolean;
    scriptsErrors: string[];
    scripts: Script[];
};

type ScriptsStore = ScriptsState & {
    getList: (options?: GetScriptsOptions) => Promise<void>;
};

const defaultScriptsState: ScriptsState = {
    listLoading: false,
    listInitialised: false,
    listErrors: [],
    list: [],
    scriptsLoading: false,
    scriptsInitialised: false,
    scriptsErrors: [],
    scripts: [],
};

export const useScripts = create<ScriptsStore>(set => {
    return {
        ...defaultScriptsState,

        async getList(options) {
            try {
                set({ listLoading: true, });
                const res = await listScripts(options);
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
