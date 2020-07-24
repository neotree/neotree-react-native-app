import * as firebase from 'firebase';
import NetInfo from '@react-native-community/netinfo';
import db from '../database/db';
import insertAuthenticatedUser from '../database/_insertAuthenticatedUser';

export const getRemoteAuthenticatedUser = () => new Promise(resolve => {
  resolve(firebase.auth().currentUser);
});

export const getLocalAuthenticatedUser = () => new Promise((resolve, reject) => {
  db.transaction(
    tx => {
      tx.executeSql(
        'select * from authenticated_user;',
        null,
        (tx, rslts) => {
          const user = rslts.rows._array[0];

          const details = (() => {
            if (!user) return null;

            try {
              return JSON.parse(user.details);
            } catch (e) {
              return null;
            }
          })();

          resolve({ user: details });
        },
        (tx, e) => {
          if (e) {
            require('@/utils/logger')('ERROR: getLocalAuthenticatedUser', e);
            reject(e);
          }
        }
      );
    }
  );
});

export const getAuthenticatedUser = () => new Promise((resolve, reject) => {
  Promise.all([
    NetInfo.fetch(), // check internet connection

    getLocalAuthenticatedUser(),
  ])
    .catch(e => {
      require('@/utils/logger')('ERROR: getAuthenticatedUser - NetInfo.fetch(), getLocalAuthenticatedUser()', e);
      reject(e);
    })
    .then(([{ isInternetReachable }, authenticated]) => {
      if (!isInternetReachable || authenticated.user) return resolve(authenticated);
      getRemoteAuthenticatedUser()
        .catch(e => {
          require('@/utils/logger')('ERROR: getAuthenticatedUser - getRemoteAuthenticatedUser()', e);
          reject(e);
        })
        .then(u => {
          if (u) insertAuthenticatedUser(u);
          resolve({ user: u });
        });
    });
});
