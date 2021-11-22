import React from 'react';
import { useAppContext } from '@/AppContext';
import * as NativeBase from 'native-base';
import NativeBaseContent from '@/components/NativeBaseContent';
import { Image, View, StatusBar, ActivityIndicator } from 'react-native';
import * as api from '@/api';

function Authentication() {
  const { initialiseApp } = useAppContext();

  const emailInputRef = React.useRef(null);
  const passwordInputRef = React.useRef(null);

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [signingIn, setSigningIn] = React.useState(false);
  const [error, setError] = React.useState(null);

  const signIn = React.useCallback(() => {
    if (!(email && password)) return;

    (async () => {
      setError(null);
      setSigningIn(true);
      try {
        await api.signIn({ email, password });
        setSigningIn(false);
        initialiseApp();
      } catch (e) { setError(e.message); setSigningIn(false); }
    })();
  }, [email, password]);

  return (
    <>
      <StatusBar translucent backgroundColor="#fff" barStyle="dark-content" />

      <NativeBaseContent
        contentContainerStyle={{ flex: 1, justifyContent: 'center', }}
      >
        <View style={{ alignItems: 'center' }}>
          <Image
            style={{ width: 150, height: 150, }}
            source={require('~/assets/images/logo.png')}
          />
        </View>

        <View style={{ marginVertical: 25 }} />

        <NativeBase.Form>
          <NativeBase.Item floatingLabel last>
            <NativeBase.Label>Email address</NativeBase.Label>
            <NativeBase.Input
              // ref={emailInputRef}
              getRef={input => (emailInputRef.current = input)}
              autoCapitalize="none"
              autoCompleteType="email"
              keyboardType="email-address"
              textContentType="username"
              returnKeyType="next"
              onSubmitEditing={() => passwordInputRef.current._root.focus()}
              blurOnSubmit={false}
              value={email}
              onChangeText={v => setEmail(v)}
            />
          </NativeBase.Item>

          <NativeBase.Item floatingLabel last>
            <NativeBase.Label>Password</NativeBase.Label>
            <NativeBase.Input
              // ref={passwordInputRef}
              getRef={input => (passwordInputRef.current = input)}
              autoCapitalize="none"
              secureTextEntry
              autoCompleteType="password"
              textContentType="password"
              returnKeyType="go"
              onSubmitEditing={signIn}
              value={password}
              onChangeText={v => setPassword(v)}
            />
          </NativeBase.Item>
        </NativeBase.Form>

        {!!error && (
          <>
            <View style={{ marginVertical: 5 }} />
            <NativeBase.Text
              style={{ color: '#b20008', textAlign: 'center' }}
            >
              {error}
            </NativeBase.Text>
          </>
        )}

        <View style={{ marginVertical: 10 }} />

        <NativeBase.Button
          block
          disabled={signingIn || !(email && password)}
          onPress={() => signIn()}
        >
          <NativeBase.Text>Sign in</NativeBase.Text>
          {signingIn && <ActivityIndicator size="small" color="blue" />}
        </NativeBase.Button>
      </NativeBaseContent>
    </>
  );
}

export default Authentication;
