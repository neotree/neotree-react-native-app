import { create } from "zustand";

type HeaderState = {
    title: string;
    subtitle: string;
};

type HeaderStore = HeaderState & {

};

const defaultHeaderState: HeaderState = {
    title: '',
    subtitle: '',
};

export const useHeader = create<HeaderStore>(set => {
    return {
        ...defaultHeaderState,
    };
});