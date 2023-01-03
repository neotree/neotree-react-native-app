import * as types from '../types';
import { dbTransaction } from './db';

export async function getAuthenticatedUser() {
    const rows = await dbTransaction('select * from authenticated_user;');
    const user = rows[0];
    return user?.details ? JSON.parse(user.details) : null;
}

export async function getLocation() {
    const rows = await dbTransaction('select * from location limit 1;', null);
    return rows[0] as (null | types.Location);
} 
