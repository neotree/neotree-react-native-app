import React from 'react';
import { TextInput as RNTextInput, ActivityIndicator } from "react-native";
import { TextInput, Br, Button, useTheme, Text  } from "../../components";
import * as api from '../../data';


type FormProps = {
	onSignInSuccess: () => any;
};

export function Form({ onSignInSuccess }: FormProps) {
	const theme = useTheme();

	const emailInputRef = React.useRef<RNTextInput>(null);
	const passwordInputRef = React.useRef<RNTextInput>(null);

	const [email, setEmail] = React.useState('');
	const [password, setPassword] = React.useState('');
    const [password2, setPassword2] = React.useState('');
    const [registration, setRegistration] = React.useState<any>(null);
	const [errors, setErrors] = React.useState<({ field?: string; message: string })[]>([]);

	const [submitting, setSubmitting] = React.useState(false);

	const submit = React.useCallback(async () => {
		try {
			if (!submitting) {
				setErrors([]);

                if (!email) {
                    setErrors(prev => [...prev, { field: 'email', message: 'Email is required.' }]);
                    return;
                }

                if (!registration) {
                    setSubmitting(true);
                    const reg = await api.checkEmailRegistration({ email });
                    setRegistration(reg);
                    setSubmitting(false);
                    return;
                }

                if (!password) {
                    setErrors(prev => [...prev, { field: 'password', message: 'Password is required.' }]);
                    return;
                }

                let user = null;
                if (registration.activated) {
                    setSubmitting(true);
                    user = await api.signIn({ 
                        email, 
                        password,
                        id: registration.userId, 
                    });
                } else {
                    if (!password2) {
                        setErrors(prev => [...prev, { field: 'password2', message: 'Password confirmation is required.' }]);
                        return;
                    } else if (password2 !== password) {
                        setErrors(prev => [...prev, { field: 'password', message: 'Passwords do not match' }, { field: 'password2', message: 'Passwords do not match' }]);
                        return;
                    }
                    setSubmitting(true);
                    user = await api.signUp({ 
                        email, 
                        password,
                        password2,
                        id: registration.userId, 
                    });
                }
                if (user) onSignInSuccess();
			}
		} catch(e: any) { 
			setErrors([{ message: e.message }]);
		} finally {
		    setSubmitting(false);
        }
	}, [email, password, submitting, registration, password2]);

	return (
		<>
			<TextInput 
				editable={!submitting}
				placeholder="Email Address"
				ref={emailInputRef}
				value={email}
				onChangeText={email => setEmail(email)}
				keyboardType="email-address"
				textContentType="username"
				autoCapitalize="none"
				returnKeyType="next"
				onSubmitEditing={() => passwordInputRef.current?.focus()}
				errors={errors.filter(e => e.field === 'email').map(e => e.message)}
			/>

			{!!registration && (
                <>
                    <Br spacing='l' />

                    <TextInput 
                        editable={!submitting}
                        placeholder="Password"
                        ref={passwordInputRef}
                        value={password}
                        onChangeText={password => setPassword(password)}
                        secureTextEntry
                        textContentType="password"
                        autoCapitalize="none"
                        returnKeyType="go"
                        onSubmitEditing={() => submit()}
                        errors={errors.filter(e => e.field === 'password').map(e => e.message)}
                    />

                    {!registration.activated && (
                        <>
                            <Br spacing='l' />

                            <TextInput 
                                editable={!submitting}
                                placeholder="Confirm password"
                                ref={passwordInputRef}
                                value={password2}
                                onChangeText={password2 => setPassword2(password2)}
                                secureTextEntry
                                textContentType="password"
                                autoCapitalize="none"
                                returnKeyType="go"
                                onSubmitEditing={() => submit()}
                                errors={errors.filter(e => e.field === 'password2').map(e => e.message)}
                            />
                        </>
                    )}
                </>
            )}

			{errors.filter(e => !e.field).map((e, i) => (
				<React.Fragment key={e.message}>
					{i === 0 && <Br spacing='l' />}
					<Text color="error">{e.message}</Text>
					<Br spacing='s'/>
				</React.Fragment>
			))}

			<Br spacing='l' />

			<Button
				onPress={submit}
				disabled={submitting}
				textStyle={{ textTransform: 'uppercase', }}
				style={{ alignItems: 'center' }}
			>
				{!submitting ? (registration ? 'Sign in' : 'Continue') : (
					<ActivityIndicator 
						color={theme.colors.primary}
						size={theme.textVariants.title1.fontSize}
					/>
				)}
			</Button>
		</>
	);
}
