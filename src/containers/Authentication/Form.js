import React from 'react';
import copy from '@/constants/copy/auth';
import { View } from 'react-native';
import Divider from '@/components/Divider';
import { useOverlayLoaderState, useAppContext } from '@/contexts/app';
import { Label, Form, Item, Input, Button } from 'native-base';
import Text from '@/components/Text';
import { useAuthenticationContext } from './Context';

const AuthForm = () => {
  const { signIn } = useAppContext();
  const { state: { form, authenticating }, setState, setForm } = useAuthenticationContext();

  const emailInputRef = React.useRef(null);
  const passwordInputRef = React.useRef(null);
  const [error, setError] = React.useState(null);

  const onChange = v => {
    setError(null);
    setForm(v);
  };

  useOverlayLoaderState('authenticate', authenticating);

  const authenticate = () => {
    if (authenticating) return;

    setState({ authenticating: true });
    setError(null);

    signIn({ email: form.email, password: form.password })
      .then(() => {
        setState({ authenticating: false });
      })
      .catch(e => {
        setError(e);
        setState({ authenticating: false });
      });
  };

  return (
    <>
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
            <Label>{copy.EMAIL_INPUT_TEXT}</Label>
            <Input
              ref={emailInputRef}
              autoCapitalize="none"
              autoCompleteType="email"
              keyboardType="email-address"
              textContentType="username"
              returnKeyType="next"
              // onSubmitEditing={() => passwordInputRef.current.focus()}
              blurOnSubmit={false}
              value={form.email}
              onChangeText={v => onChange({ email: v })}
            />
          </Item>

          <Item floatingLabel last>
            <Label>{copy.PASSWORD_INPUT_TEXT}</Label>
            <Input
              ref={passwordInputRef}
              autoCapitalize="none"
              secureTextEntry
              autoCompleteType="password"
              textContentType="password"
              returnKeyType="go"
              onSubmitEditing={authenticate}
              value={form.password}
              onChangeText={v => onChange({ password: v })}
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
            disabled={authenticating}
            onPress={authenticate}
          >
            <Text>{copy.SIGN_IN_BUTTON_TEXT}</Text>
          </Button>
        </Form>
      </View>
    </>
  );
};

export default AuthForm;
