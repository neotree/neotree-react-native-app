import 'react-native-gesture-handler';
import * as React from 'react';
import * as firebase from 'firebase';

import { NativeRouter, BackButton } from 'react-router-native';
import Main from '@';

import firebaseConfig from './config/firebase.config';

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
