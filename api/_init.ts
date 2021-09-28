import { InitApiResults } from '@/types';
import { initialiseTables } from './db';
import { getAuthenticatedUser } from './_user';

export function init(): Promise<InitApiResults> {
    return new Promise((resolve) => {
        (async () => {
            await initialiseTables();
            const authenticatedUser = await getAuthenticatedUser();
            console.log(authenticatedUser);
            resolve({
                authenticatedUser,
            });
        })();
    });
}
