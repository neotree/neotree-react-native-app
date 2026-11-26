import NetInfo from '@react-native-community/netinfo';

import { makeApiCall, REMOTE_PROBE_TIMEOUT_MS } from './api';
import { dbTransaction } from './db';
import { getAuthenticatedUser } from './queries';

export const checkEmailRegistration = async ({ email }: { email: string }) => {
    const networkState = await NetInfo.fetch();
    if (!networkState.isInternetReachable) throw new Error('No internet connection');

    const res = await makeApiCall('webeditor', '/check-email-registration?email='+email, {}, { useHost: true, });

    const json = await res.json();

    if (json?.errors) throw new Error(json.errors.map((e: any) => e?.message || e).join(', '));

    if (json?.deactivated) throw new Error(DEACTIVATED_ACCOUNT_MESSAGE);

    return json;
};

export const DEACTIVATED_ACCOUNT_MESSAGE = 'This account has been deactivated. Please contact an administrator.';

/**
 * Asks the editor whether a signed-in user has been deactivated. Only a clear "yes" counts: no
 * connection, an error or an unknown email must never sign anyone out.
 */
export async function isUserDeactivated(email?: string | null): Promise<boolean> {
    if (!email) return false;
    try {
        const res = await makeApiCall(
            'webeditor',
            '/check-email-registration?email=' + encodeURIComponent(email),
            {},
            { useHost: true, timeout: REMOTE_PROBE_TIMEOUT_MS },
        );
        const json = await res.json();
        return json?.deactivated === true;
    } catch {
        return false;
    }
}

export const logout = () => new Promise((resolve, reject) => {
    (async () => {
        try {
            // makeApiCall('webeditor', '/logout', {}, { useHost: true, })
            //     .then(() => {})
            //     .catch(() => {});

            await dbTransaction(
                'insert or replace into authenticated_user (id, details) values (?, ?);',
                [1, null],
            );

            resolve(null);
        } catch (e) { 
            reject(e); }
    })();
});

export async function signIn({ id, email, password }: { 
    id: string;
    email: string; 
    password: string; 
}) {
    const res = await makeApiCall('webeditor', '/sign-in', {
        method: 'POST',
        body: JSON.stringify({
            id,
            username: email,
            password,
        }),
    }, { useHost: true });
    const json = await res.json();

    if (json?.errors) throw new Error(json.errors.map((e: any) => e?.message || e).join(', '));

    if (json?.user) {					
        await dbTransaction(
            'insert or replace into authenticated_user (id, details) values (?, ?);',
            [1, JSON.stringify(json.user)],
        );
    }

    return await getAuthenticatedUser();
}

export async function signUp({ id, email, password, password2 }: { 
    id: string,
    email: string; 
    password: string; 
    password2: string; 
}) {
    const res = await makeApiCall('webeditor', '/sign-up', {
        method: 'POST',
        body: JSON.stringify({
            id,
            username: email,
            password,
            password2,
        }),
    }, { useHost: true });
    const json = await res.json();

    if (json?.errors) throw new Error(json.errors.map((e: any) => e?.message || e).join(', '))

    if (json?.user) {						
        await dbTransaction(
            'insert or replace into authenticated_user (id, details) values (?, ?);',
            [1, JSON.stringify(json.user)],
        );
    }

    return await getAuthenticatedUser();
}
