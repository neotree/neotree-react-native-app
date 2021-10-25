import React from 'react';
import { ScrollView, View } from 'react-native';
import { Button, Text, TextField, Content, useTheme, Br } from '@/components/ui';
import * as copy from '@/constants/copy/loginScreen';
import { APP_NAME } from '@/constants';
import { Logo } from '@/components/Logo';
import { logIn  } from '@/api';
import { useAppContext } from '@/AppContext';

export function LoginScreen() {
    const theme = useTheme();
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [loggingIn, setLoggingIn] = React.useState(false);
    const [error, setError] = React.useState(null);
    const { refreshApp } = useAppContext();

    const emailInputRef = React.useRef(null);
    const passwordInputRef = React.useRef(null);

    const onLogIn = React.useCallback(() => {
        setError(null);
        setLoggingIn(true);
        (async () => {
            try {
                const user = await logIn({ email, password });
                setLoggingIn(false);
                refreshApp();
            } catch (e) { 
                setLoggingIn(false);
                setError(e.message); 
            }
        })();
    }, [email, password]);

    return (
        <ScrollView
            contentContainerStyle={{
                flex: 1,
                justifyContent: 'center',
                backgroundColor: theme.palette.background.paper,
            }}
        >   
            <Content variant="outlined">
                <View style={{ alignItems: 'center', marginVertical: 50 }}>
                    <Logo size="large" />
                    {/* <Text variant="h3">{APP_NAME}</Text> */}
                </View>

                <TextField 
                    ref={emailInputRef}
                    label={copy.EMAIL_ADDRESS}
                    variant="outlined"
                    onChangeText={v => setEmail(v)}
                    autoCapitalize="none"
                    autoCompleteType="email"
                    keyboardType="email-address"
                    textContentType="username"
                    returnKeyType="next"
                    onSubmitEditing={() => passwordInputRef.current.focus()}
                    blurOnSubmit={false}
                    required
                    editable={!loggingIn}
                />
                
                <Br /><Br />

                <TextField 
                    ref={passwordInputRef}
                    label={copy.PASSWORD}
                    variant="outlined"
                    onChangeText={v => setPassword(v)}
                    autoCapitalize="none"
                    secureTextEntry
                    autoCompleteType="password"
                    textContentType="password"
                    returnKeyType="go"
                    required
                    editable={!loggingIn}
                    onSubmitEditing={onLogIn}
                />
                
                <Br />
                {!!error && <Text style={{ textAlign: 'right' }} variant="caption" color="error">{error}</Text>}
                <Br />

                <View style={{ alignItems: 'flex-end' }}>
                    <Button
                        variant="contained"
                        color="primary"
                        // fullWidth={false}
                        disabled={loggingIn || !(email && password)}
                        onPress={onLogIn}
                    >
                        <Text>{loggingIn ? copy.PLEASE_WAIT : copy.LOGIN}</Text>
                    </Button>
                </View>
            </Content>
        </ScrollView>
    );
};
