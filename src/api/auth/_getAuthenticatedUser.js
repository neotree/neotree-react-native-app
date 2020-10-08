import * as firebase from 'firebase';
import NetInfo from '@react-native-community/netinfo';
import getLocalAuthenticatedUser from '../database/getAuthenticatedUser';
import insertAuthenticatedUser from '../database/_insertAuthenticatedUser';

export const getRemoteAuthenticatedUser = () => new Promise(resolve => {
  resolve(firebase.auth().currentUser);
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
