import 'react-native-gesture-handler';
import * as React from 'react';
import * as firebase from 'firebase';
import { NativeRouter, BackButton } from 'react-router-native';
import Constants from 'expo-constants';
import Main from '@';

const isProd = Constants.manifest.extra.BUILD_TYPE === 'production';
const firebaseConfig = isProd ? require('~/config/prod-firebase.config.json') : require('~/config/firebase.config.json');

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
