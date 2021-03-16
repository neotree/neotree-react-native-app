import 'react-native-gesture-handler';
import React from 'react';
import { Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import * as firebase from 'firebase';
import Constants from 'expo-constants';
import Splash from '@/components/Splash';
import NativeBaseContainer from './native-base-theme';
import Main from './src';

const firebaseConfig = Constants.manifest.extra.firebaseConfig;
firebase.initializeApp(firebaseConfig);

const App = () => {
  const [nativeBaseInitiased, setNativeBaseInitiased] = React.useState(false);
  const [error, setError] = React.useState(null);

  if (error) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: '#b20008', marginVertical: 10 }}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <NavigationContainer>
        <NativeBaseContainer
          onInit={e => {
            setNativeBaseInitiased(true);
            setError(e);
          }}
        >
          <Main />
        </NativeBaseContainer>

        {!nativeBaseInitiased && <Splash />}
      </NavigationContainer>
    </View>
  );
};

export default App;
