import { create } from "zustand";
import { io } from 'socket.io-client';

export type SocketState = {
    socketInitialised: boolean;
    socket: null | ReturnType<typeof io>;
};

export type SocketStore = SocketState & {
    init: (url: string) => Promise<void>;
};

export const defaultSocketState: SocketState = {
    socket: null,
    socketInitialised: false,
};

export const useSocket = create<SocketStore>(set => {
    return {
        ...defaultSocketState,
        async init(url) {
            if (url) {
                const socket = io(url);
                set({ socketInitialised: true, socket, });
            }
        },
    };
});