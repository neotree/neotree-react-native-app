import * as firebase from 'firebase';

export { default as getAuthenticatedUser } from './getAuthenticatedUser';

export const signOut = () => firebase.auth().signOut();

export const signIn = (params = {}) => new Promise((resolve, reject) => {
  firebase.auth()
    .signInWithEmailAndPassword(params.email, params.password)
    .then(resolve)
    .catch(reject);
});

export const onAuthStateChanged = cb => firebase.auth()
  .onAuthStateChanged(user => cb && cb(user));
