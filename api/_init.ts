import { initialiseTables,  } from './db';
import { getApplication } from './_application';
import { getLocation } from './_location';
import { getAuthenticatedUser } from './_user';
import { sync } from './_sync';
import * as types from './types';

export type InitApiResults = {
    location?: types.Location;
    authenticatedUser?: types.AuthenticatedUser;
    application?: types.Application;
    error?: Error;
};

export function init(): Promise<InitApiResults> {
    return new Promise((resolve, reject) => {
        (async () => {
            try {
                await initialiseTables();
                const authenticatedUser = await getAuthenticatedUser();
                const location = await getLocation();
                let application = null;
                if (location && authenticatedUser) {
                    application = await getApplication();
                    try {
                        await sync();
                    } catch (e) {
                        if (!application.last_sync_date) reject(e);
                    }
                    application = await getApplication();
                }
                resolve({
                    application,
                    location,
                    authenticatedUser,
                });
            } catch (e) { reject(e); }
        })();
    });
}
