import 'react-native-gesture-handler';
import * as React from 'react';
import * as firebase from 'firebase';
import { NativeRouter, BackButton } from 'react-router-native';
import Constants from 'expo-constants';
import Main from '@';

const firebaseConfig = Constants.manifest.extra.firebaseConfig;
firebase.initializeApp(firebaseConfig);

const App = () => {
  return (
    <>
      <NativeRouter>
        <BackButton>
          <Main />
        </BackButton>
      </NativeRouter>
    </>
  );
};

export default App;
