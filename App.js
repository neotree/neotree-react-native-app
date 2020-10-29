/* global __DEV__ */
import 'react-native-gesture-handler';
import * as React from 'react';
import * as firebase from 'firebase';
import { NativeRouter, BackButton } from 'react-router-native';
import Main from '@';

const firebaseConfig = __DEV__ ? require('~/config/firebase.config.json') : require('~/config/prod-firebase.config.json');

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
