import 'react-native-gesture-handler';
import * as React from 'react';
import * as firebase from 'firebase';
import firebaseConfig from './config/firebase.config';

import { NativeRouter } from "react-router-native";
import Main from '@';

firebase.initializeApp(firebaseConfig);

const App = () => {
  return (
    <>
      <NativeRouter>
        <Main />
      </NativeRouter>
    </>
  )
};

export default App;
