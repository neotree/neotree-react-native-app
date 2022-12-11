import React from 'react';
import { View, Image, TextInput as RNTextInput, ActivityIndicator } from "react-native";
import assets from "../assets";
import { TextInput, Content, Box, Br, Button, useTheme  } from "../components";

export function Login() {
	const theme = useTheme();

	const emailInputRef = React.useRef<RNTextInput>(null);
	const passwordInputRef = React.useRef<RNTextInput>(null);

	const [email, setEmail] = React.useState('');
	const [password, setPassword] = React.useState('');

	const [submitting, setSubmitting] = React.useState(false);

	const submit = React.useCallback(async () => {
		if (!submitting) {
			setSubmitting(true);
			setTimeout(() => setSubmitting(false), 2500);
		}
	}, [email, password, submitting]);

	return (
		<View style={{ flex: 1 }}>
			<View
				style={{ 
					flex: 1,
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				<Content>
					<Image 
						source={assets.darkLogo}
						style={{
							width: 300,
							height: 300,
						}}
					/>
				</Content>
			</View>

			<Box
				paddingVertical="m"
			>
				<Content>
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
				</Content>
			</Box>
		</View>
	);
}
