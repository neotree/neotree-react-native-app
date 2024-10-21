import { create } from "zustand";

export type HeaderState = {
    title: string;
    subtitle: string;
    backButtonVisible: boolean;
    menuButtonVisible: boolean;
    node: React.ReactNode;
};

export type HeaderStore = HeaderState & {
    onUnmount: () => void;
    setState: (partialState: Partial<HeaderState> | ((partialState: Partial<HeaderState>) => void)) => void;
};

export const defaultHeaderState: HeaderState = {
    title: '',
    subtitle: '',
    backButtonVisible: false,
    menuButtonVisible: false,
    node: null,
};

export const useHeader = create<HeaderStore>(set => {
    return {
        ...defaultHeaderState,
        setState: set,
        onUnmount: () => set(defaultHeaderState),
    };
});