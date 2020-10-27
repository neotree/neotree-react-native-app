import React from 'react';
import { ScrollView, View, ActivityIndicator } from 'react-native';
import Divider from '@/components/Divider';
import Text from '@/components/Text';
import Logo from '@/components/Logo';
import Splash from '@/components/Splash';
import { Label, Form, Item, Input, Button } from 'native-base';
import { useAppContext } from '@/AppContext';
import * as api from '@/api';

const Authentication = () => {
  const { sync } = useAppContext();

  const emailInputRef = React.useRef(null);
  const passwordInputRef = React.useRef(null);

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const [signingIn, setSigningIn] = React.useState(false);
  const [syncingData, setSyncingData] = React.useState(false);
  const [error, setError] = React.useState(null);

  const signIn = async () => {
    const done = e => {
      setSigningIn(false);
      setSyncingData(false);
      setError(e);
    };

    setSigningIn(true);

    try {
      await api.signIn({ email, password });
      done();
    } catch (e) { return done(e); }

    setSyncingData(true);

    try { await sync(); } catch (e) { return done(e); }
  };

  if (syncingData) return <Splash text="Syncing data, this may take a while..." />;

  return (
    <>
      <ScrollView
        contentContainerStyle={[
          {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
          }
        ]}
        keyboardShouldPersistTaps="never"
      >
        <>
          <Logo color="black" />

          <View
            style={[
              {
                width: '100%',
                maxWidth: 500,
                padding: 20
              }
            ]}
          >
            <Form>
              <Item floatingLabel>
                <Label>Email address</Label>
                <Input
                  ref={emailInputRef}
                  autoCapitalize="none"
                  autoCompleteType="email"
                  keyboardType="email-address"
                  textContentType="username"
                  returnKeyType="next"
                  // onSubmitEditing={() => passwordInputRef.current.focus()}
                  blurOnSubmit={false}
                  value={email}
                  onChangeText={v => setEmail(v)}
                />
              </Item>

              <Item floatingLabel last>
                <Label>Password</Label>
                <Input
                  ref={passwordInputRef}
                  autoCapitalize="none"
                  secureTextEntry
                  autoCompleteType="password"
                  textContentType="password"
                  returnKeyType="go"
                  onSubmitEditing={signIn}
                  value={password}
                  onChangeText={v => setPassword(v)}
                />
              </Item>

              <Divider border={false} />

              {!error ? null : (
                <>
                  <Text
                    error
                    style={{ textAlign: 'center', color: '#b20008' }}
                  >
                    {error.message || error.msg || JSON.stringify(error)}
                  </Text>

                  <Divider border={false} />
                </>
              )}

              <Button
                block
                disabled={signingIn}
                onPress={signIn}
              >
                <Text>Sign in</Text>
                {signingIn && <ActivityIndicator size="small" color="blue" />}
              </Button>
            </Form>
          </View>
        </>
      </ScrollView>
    </>
  );
};

export default Authentication;
