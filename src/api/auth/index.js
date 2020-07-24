import * as firebase from 'firebase';
import insertAuthenticatedUser from '../database/_insertAuthenticatedUser';

export * from './getAuthenticatedUser';

export const signOut = () => new Promise((resolve, reject) => {
  firebase
    .auth()
    .signOut()
    .catch(reject)
    .then(() => {
      insertAuthenticatedUser(null)
        .catch(reject)
        .then(() => resolve());
    });
});

export const signIn = (params = {}) => new Promise((resolve, reject) => {
  firebase.auth()
    .signInWithEmailAndPassword(params.email, params.password)
    .catch(reject)
    .then(u => {
      insertAuthenticatedUser(u)
        .catch(reject)
        .then(() => resolve(u));
    });
});

export const onAuthStateChanged = cb => firebase.auth()
  .onAuthStateChanged(user => cb && cb(user));
