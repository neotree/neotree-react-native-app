import { useState, useEffect } from 'react';

import { getAuthenticationInfo, defaultAuthenticationInfo } from '@/data/auth';

export function useAuthentication() {
    const [info, setInfo] = useState<typeof defaultAuthenticationInfo>(defaultAuthenticationInfo);
    const [authInfoLoaded, setAuthInfoLoaded] = useState(false);

    useEffect(() => {
        (async () => {
            const res = await getAuthenticationInfo();
            setInfo(res);
            setAuthInfoLoaded(true);
        })();
    }, []);

    return {
        ...info.data,
        loadAuthInfoErrors: info.errors,
        authInfoLoaded,
    };
}