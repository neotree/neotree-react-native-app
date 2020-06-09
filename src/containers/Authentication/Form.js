import React from 'react';
import copy from '@/constants/copy/auth';
import makeStyles from '@/ui/styles/makeStyles';
import { signIn } from '@/api/auth';
import { View } from 'react-native';
import Input from '@/ui/Input';
import Button from '@/ui/Button';
import Divider from '@/ui/Divider';
import Typography from '@/ui/Typography';
import { useOverlayLoaderState } from '@/contexts/app';
import { useAuthenticationContext } from './Context';

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    maxWidth: 500,
    padding: theme.spacing(2)
  }
}));

const Form = () => {
  const emailInputRef = React.useRef(null);
  const passwordInputRef = React.useRef(null);

  const [error, setError] = React.useState(null);

  const { state: { form, authenticating }, setState, setForm } = useAuthenticationContext();

  const onChange = v => {
    setError(null);
    setForm(v);
  };

  const styles = useStyles();

  useOverlayLoaderState('authenticate', authenticating);

  const authenticate = () => {
    if (authenticating) return;

    setState({ authenticating: true });
    setError(null);

    const done = (e) => {
      if (e) setError(e);
      setState({ authenticating: false });
    };

    signIn({ email: form.email, password: form.password })
      .then(() => done(null))
      .catch(done);
  };

  return (
    <>
      <View style={[styles.root]}>
        <Input
          ref={emailInputRef}
          fullWidth
          size="xl"
          color="secondary"
          autoCapitalize="none"
          autoCompleteType="email"
          keyboardType="email-address"
          textContentType="username"
          placeholder={copy.EMAIL_INPUT_TEXT}
          returnKeyType="next"
          onSubmitEditing={() => passwordInputRef.current.focus()}
          blurOnSubmit={false}
          value={form.email}
          onChangeText={v => onChange({ email: v })}
        />

        <Divider border={false} />

        <Input
          ref={passwordInputRef}
          fullWidth
          size="xl"
          color="secondary"
          autoCapitalize="none"
          secureTextEntry
          autoCompleteType="password"
          textContentType="password"
          placeholder={copy.PASSWORD_INPUT_TEXT}
          returnKeyType="go"
          onSubmitEditing={authenticate}
          value={form.password}
          onChangeText={v => onChange({ password: v })}
        />

        <Divider border={false} />

        {!error ? null : (
          <>
            <Typography
              variant="caption"
              color="error"
              style={{ textAlign: 'center' }}
            >
              {error.message || error.msg || JSON.stringify(error)}
            </Typography>

            <Divider border={false} />
          </>
        )}

        <Button
          size="xl"
          color="secondary"
          variant="contained"
          disabled={authenticating}
          onPress={authenticate}
        >
          {copy.SIGN_IN_BUTTON_TEXT}
        </Button>
      </View>
    </>
  );
};

export default Form;
