import * as firebase from 'firebase';
import NetInfo from '@react-native-community/netinfo';
import { dbTransaction } from './database/db';

export const getAuthenticatedUser = () => new Promise((resolve, reject) => {
  (async () => {
    try {
      const rows = await dbTransaction('select * from authenticated_user;', null, 'main');
      const user = rows[0];

      const details = (() => {
        if (!user) return null;
        try { return JSON.parse(user.details); } catch (e) { return null; }
      })();

      resolve(details);
    } catch (e) { reject(e); }
  })();
});

export const signIn = (params = {}) => new Promise((resolve, reject) => {
  (async () => {
    try {
      const networkState = await NetInfo.fetch();
      if (!networkState.isInternetReachable) throw new Error('No internet connection');

      const user = await firebase.auth().signInWithEmailAndPassword(params.email, params.password);
      await dbTransaction(
        'insert or replace into authenticated_user (id, details) values (?, ?);',
        [1, JSON.stringify(user)],
        'main'
      );

      const authenticatedUser = await getAuthenticatedUser();
      resolve(authenticatedUser);
    } catch (e) { reject(e); }
  })();
});

export const signOut = () => new Promise((resolve, reject) => {
  (async () => {
    try {
      const networkState = await NetInfo.fetch();
      if (!networkState.isInternetReachable) throw new Error('No internet connection');

      await firebase.auth().signOut();
      await dbTransaction(
        'insert or replace into authenticated_user (id, details) values (?, ?);',
        [1, null],
        'main'
      );

      resolve(null);
    } catch (e) { reject(e); }
  })();
});
