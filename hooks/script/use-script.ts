import { create } from "zustand";

import { getScript } from '@/data/queries/scripts';

type ScriptState = {
    scriptLoading: boolean;
    scriptInitialised: boolean;
    script: Awaited<ReturnType<typeof getScript>>['data'];
    scriptErrors: Awaited<ReturnType<typeof getScript>>['errors'];
};

type ScriptStore = ScriptState & {
    reset: () => void;
    getScript: (scriptId: string, options?: { reset?: boolean; }) => Promise<void>;
};

const defaultScriptState: ScriptState = {
    scriptLoading: false,
    scriptInitialised: false,
    script: null,
    scriptErrors: [],
};

export const useScript = create<ScriptStore>(set => {
    const reset = () => set(defaultScriptState);

    return {
        ...defaultScriptState,

        reset,

        async getScript(scriptId: string, options) {
            try {
                set({ 
                    ...(options?.reset ? defaultScriptState : {}),
                    scriptLoading: true, 
                    scriptErrors: [], 
                });
                const res = await getScript(scriptId);
                set({
                    scriptErrors: res.errors || [],
                    script: res.data,
                });
            } catch(e: any) {
                set({ scriptErrors: [e.message], });
            } finally {
                set({ scriptLoading: false, scriptInitialised: true, });
            }
        }
    };
});
