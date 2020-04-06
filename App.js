import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import * as firebase from 'firebase';
import firebaseConfig from './config/firebase.config';
import Main from '@';

firebase.initializeApp(firebaseConfig);

const App = () => {
  return (
    <>
      <NavigationContainer>
        <Main />
      </NavigationContainer>
    </>
  )
};

export default App;
