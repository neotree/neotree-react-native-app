import firebase from 'firebase/app';
import 'firebase/auth';
import Constants from 'expo-constants';

const firebaseConfig = Constants.manifest.extra.firebaseConfig;

let Firebase;

if (firebase.apps.length === 0) {
  Firebase = firebase.initializeApp(firebaseConfig);
}

export default Firebase;
