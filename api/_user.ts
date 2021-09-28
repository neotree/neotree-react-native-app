import NetInfo from '@react-native-community/netinfo';
import { NO_INTERNET  } from '@/constants/copy/common';
import { dbTransaction } from './db';
import firebase from './_firebase';
import { AuthenticatedUserRow, AuthenticatedUser } from './types';

export const logIn = async (
    params: {
        email: string;
        password: string;
    }
): Promise<AuthenticatedUser | null> => {
    const networkState = await NetInfo.fetch();
    if (!networkState.isInternetReachable) throw new Error(NO_INTERNET);

    const res = await firebase.auth().signInWithEmailAndPassword(params.email, params.password);
    await dbTransaction(
        'insert or replace into authenticated_user (id, details) values (?, ?);',
        [1, JSON.stringify(res?.user)],
        'main'
    );
    return res?.user as AuthenticatedUser;
}

export const logOut = async () => {
    
}

export const getAuthenticatedUser = () => new Promise<AuthenticatedUser | null>((resolve, reject) => {
    (async () => {
      try {
        const rows = await dbTransaction<AuthenticatedUserRow[]>('select * from authenticated_user;', null, 'main');
        const user = rows[0];
  
        const details = (() => {
            if (!user) return null;
            try { 
                return JSON.parse(user.details) as AuthenticatedUser; 
            } catch (e) { return null; }
        })();
  
        resolve(details);
      } catch (e) { reject(e); }
    })();
  });
