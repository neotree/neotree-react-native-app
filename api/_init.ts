import { initialiseTables,  } from './db';
import { getApplication } from './_application';
import { getLocation } from './_location';
import { getAuthenticatedUser } from './_user';
import * as types from './types';

export type InitApiResults = {
    location: types.Location;
    authenticatedUser: types.AuthenticatedUser;
    application: types.Application;
};

export function init(): Promise<InitApiResults> {
    return new Promise((resolve) => {
        (async () => {
            await initialiseTables();
            const authenticatedUser = await getAuthenticatedUser();
            const location = await getLocation();
            const application = await getApplication();
            resolve({
                application,
                location,
                authenticatedUser,
            });
        })();
    });
}
