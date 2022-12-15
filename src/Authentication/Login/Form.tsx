import React from 'react';
import { TextInput as RNTextInput, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TextInput, Br, Button, useTheme  } from "../../components";
import { makeApiCall } from '../../api';
import { NEOTREE_DATA_AUTHENTICATED_USER_KEY } from '../../constants';

type FormProps = {
	onLoginSuccess: () => any;
};

export function Form({ onLoginSuccess }: FormProps) {
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
					const res = await makeApiCall('webeditor', '/sign-in', {
						method: 'POST',
						body: JSON.stringify({
							username: email,
							password,
						}),
					}, { useHost: true });
					const json = await res.json();
					const user = json?.user;
					if (user) {
						success = true;
						AsyncStorage.setItem(NEOTREE_DATA_AUTHENTICATED_USER_KEY, JSON.stringify(user));
					}
				} else {
					if (!password) setErrors(prev => [...prev, { field: 'password', message: 'Password is required.' }]);
					if (!email) setErrors(prev => [...prev, { field: 'email', message: 'Email is required.' }]);
				}
			}
		} catch(e) { console.log(e); }
		setSubmitting(false);
		if (success) onLoginSuccess();
	}, [email, password, submitting]);

	return (
		<>
			<TextInput 
				editable={!submitting}
				size="l"
				placeholder="Email Address"
				ref={emailInputRef}
				value={email}
				onChangeText={email => setEmail(email)}
				keyboardType="email-address"
				returnKeyType="next"
				onSubmitEditing={() => passwordInputRef.current?.focus()}
				errors={errors.filter(e => e.field === 'email').map(e => e.message)}
			/>

			<Br spacing='l' />

			<TextInput 
				editable={!submitting}
				size="l"
				placeholder="Password"
				ref={passwordInputRef}
				value={password}
				onChangeText={password => setPassword(password)}
				secureTextEntry
				textContentType="password"
				returnKeyType="go"
				onSubmitEditing={() => submit()}
				errors={errors.filter(e => e.field === 'password').map(e => e.message)}
			/>

			<Br spacing='l' />

			<Button
				onPress={submit}
				size="l"
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
