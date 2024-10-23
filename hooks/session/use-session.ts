import { create } from "zustand";

import { getSession } from '@/data/queries/sessions';

type SessionState = {
    sessionLoading: boolean;
    sessionInitialised: boolean;
    session: Awaited<ReturnType<typeof getSession>>['data'];
    sessionErrors: Awaited<ReturnType<typeof getSession>>['errors'];
};

type SessionStore = SessionState & {
    reset: () => void;
    getSession: (sessionId: string, options?: { reset?: boolean; }) => Promise<void>;
};

const defaultSessionState: SessionState = {
    sessionLoading: false,
    sessionInitialised: false,
    session: null,
    sessionErrors: [],
};

export const useSession = create<SessionStore>(set => {
    const reset = () => set(defaultSessionState);

    return {
        ...defaultSessionState,

        reset,

        async getSession(sessionId: string, options) {
            try {
                set({ 
                    ...(options?.reset ? defaultSessionState : {}),
                    sessionLoading: true, 
                    sessionErrors: [], 
                });
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
        }
    };
});
