import NetInfo from '@react-native-community/netinfo';

import { makeApiCall } from './api';
import { dbTransaction } from './db';
import { getAuthenticatedUser } from './queries';

export const checkEmailRegistration = async ({ email }: { email: string }) => {
    const networkState = await NetInfo.fetch();
    if (!networkState.isInternetReachable) throw new Error('No internet connection');

    const res = await makeApiCall('webeditor', '/check-email-registration?email='+email, {}, { useHost: true, });

    const json = await res.json();

    if (json?.errors) throw new Error(json.errors.map((e: any) => e?.message || e).join(', '));

    return json;
};

export const logout = () => new Promise((resolve, reject) => {
    (async () => {
        try {
            makeApiCall('webeditor', '/logout', {}, { useHost: true, })
                .then(() => {})
                .catch(() => {});

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
