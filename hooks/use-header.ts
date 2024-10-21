import { create } from "zustand";

type HeaderState = {
    title: string;
    subtitle: string;
    backButtonVisible: boolean;
};

type HeaderStore = HeaderState & {

};

const defaultHeaderState: HeaderState = {
    title: '',
    subtitle: '',
    backButtonVisible: false,
};

export const useHeader = create<HeaderStore>(set => {
    return {
        ...defaultHeaderState,
    };
});