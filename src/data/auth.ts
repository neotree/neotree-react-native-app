import NetInfo from '@react-native-community/netinfo';

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

import { makeApiCall } from './api';
import { dbTransaction } from './db';
import { getAuthenticatedUser } from './queries';
import {handleAppCrush} from '../utils/handleCrashes'
export const login = (params: { email: string; password: string; }) => new Promise((resolve, reject) => {
    (async () => {
        try {
            const networkState = await NetInfo.fetch();
            if (!networkState.isInternetReachable) throw new Error('No internet connection');

            const user = await firebase.auth().signInWithEmailAndPassword(params.email, params.password);
            await dbTransaction(
                'insert or replace into authenticated_user (id, details) values (?, ?);',
                [1, JSON.stringify(user)],
            );

            const authenticatedUser = await getAuthenticatedUser();
            resolve(authenticatedUser);
        } catch (e) { 
            handleAppCrush(e) 
            reject(e); }
    })();
});

export const logout = () => new Promise((resolve, reject) => {
    (async () => {
        try {
            await dbTransaction(
                'insert or replace into authenticated_user (id, details) values (?, ?);',
                [1, null],
            );
            resolve(null);
        } catch (e) {
            handleAppCrush(e) 
            reject(e); }
    })();
});

export async function signIn({ email, password }: { email: string; password: string; }) {
    const res = await makeApiCall('webeditor', '/sign-in', {
        method: 'POST',
        body: JSON.stringify({
            username: email,
            password,
        }),
    }, { useHost: true });
    const json = await res.json();

    if (json?.errors) throw new Error(json.errors.map((e: string) => ({ message: e })).join(', '))

    if (json?.user) {						
        await dbTransaction(
            'insert or replace into authenticated_user (id, details) values (?, ?);',
            [1, JSON.stringify(json.user)],
        );
    }

    return await getAuthenticatedUser();
}
