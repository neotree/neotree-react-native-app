import { create } from "zustand";

import { GetSessionsOptions, SessionListItem } from "@/types";
import { listSessions, getSession } from '@/data/queries/sessions';

type SessionsState = {
    listLoading: boolean;
    listInitialised: boolean;
    listErrors: string[];
    list: SessionListItem[];
    sessionLoading: boolean;
    sessionInitialised: boolean;
    session: Awaited<ReturnType<typeof getSession>>['data'];
    sessionErrors: Awaited<ReturnType<typeof getSession>>['errors'];
};

type SessionsStore = SessionsState & {
    getList: (options?: (GetSessionsOptions & { silent?: boolean; })) => Promise<void>;
};

const defaultSessionsState: SessionsState = {
    listLoading: false,
    listInitialised: false,
    listErrors: [],
    list: [],
    sessionLoading: false,
    sessionInitialised: false,
    session: null,
    sessionErrors: [],
};

export const useSessions = create<SessionsStore>(set => {
    return {
        ...defaultSessionsState,

        async getList(options) {
            try {
                const { silent, ...opts } = { ...options };
                set({ listLoading: !silent, });
                const res = await listSessions(opts);
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

        async getSession(sessionId: string) {
            try {
                set({ sessionLoading: true, sessionErrors: [], });
                const res = await getSession(sessionId);
                set({
                    sessionErrors: res.errors || [],
                    session: res.data,
                });
            } catch(e: any) {
                set({ sessionErrors: [e.message], });
            } finally {
                set({ sessionLoading: false, sessionInitialised: true, });
            }
        },
    };
});
