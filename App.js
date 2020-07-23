import 'react-native-gesture-handler';
import * as React from 'react';
import * as firebase from 'firebase';
import { NativeRouter, BackButton } from 'react-router-native';
import io from 'socket.io-client';
import Main from '@';
import apiConfig from '~/config/neotree-webeditor-api.json';
import firebaseConfig from './config/firebase.config.json';

const socket = io(apiConfig.host);
firebase.initializeApp(firebaseConfig);

const App = () => {
  return (
    <>
      <NativeRouter>
        <BackButton>
          <Main socket={socket} />
        </BackButton>
      </NativeRouter>
    </>
  );
};

export default App;
