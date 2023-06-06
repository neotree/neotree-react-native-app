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
	const [errors, setErrors] = React.useState<({ field?: string; message: string })[]>([]);

	const [submitting, setSubmitting] = React.useState(false);

	const submit = React.useCallback(async () => {
		let success = false;
		try {
			if (!submitting) {
				setErrors([]);
				if (password && email) {
					setSubmitting(true);
					console.log("BIF===",password,email)
					const user = await api.login({ email, password });
					console.log("BWRM===",user)
					if (user) success = true;
				} else {
					if (!password) setErrors(prev => [...prev, { field: 'password', message: 'Password is required.' }]);
					if (!email) setErrors(prev => [...prev, { field: 'email', message: 'Email is required.' }]);
				}
			}
		} catch(e: any) { 
			console.log(e);  
			setErrors([{ message: e.message }]);
		}
		setSubmitting(false);
		if (success) onSignInSuccess();
	}, [email, password, submitting]);

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

			{errors.filter(e => !e.field).map((e, i) => (
				<React.Fragment key={e.message}>
					{i === 0 && <Br spacing='l' />}
					<Text color="error">{e.message}</Text>
					<Br />
				</React.Fragment>
			))}

			<Br spacing='l' />

			<Button
				onPress={submit}
				disabled={submitting}
				textStyle={{ textTransform: 'uppercase', }}
				style={{ alignItems: 'center' }}
			>
				{!submitting ? 'Sign in' : (
					<ActivityIndicator 
						color={theme.colors.primary}
						size={theme.textVariants.title1.fontSize}
					/>
				)}
			</Button>
		</>
	);
}
