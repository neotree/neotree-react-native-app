import { createStore } from "zustand";

import AsyncStorage from "@/data/async-storage";

type NeotreeConstantsState = Awaited<ReturnType<typeof AsyncStorage.getAll>>;

const defaultState = null! as NeotreeConstantsState;

export const NeotreeConstantsStore = createStore<NeotreeConstantsState & {
    setState: (partialState: Partial<NeotreeConstantsState>) => void;
}>(set => {
    return {
        ...defaultState,
        setState: partialState => set({ ...partialState, }),
    };
});