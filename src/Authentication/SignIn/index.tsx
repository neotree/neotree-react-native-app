import React from 'react';
import { ActivityIndicator } from 'react-native';
import { Box, Br, Text, useTheme, Button  } from "../../components";
import { Form } from './Form';
import { api } from '../../data';
import { useAppContext } from '../../AppContext';

type SignInProps = { onSignIn: () => void; };

export function SignIn({ onSignIn }: SignInProps) {
	const ctx = useAppContext();
	const theme = useTheme();

	const [loggedIn, setLoggedIn] = React.useState(false);
	const [initialiseDataFailed, setInitialiseDataFailed] = React.useState(false);

	const onSignInSuccess = React.useCallback(() => {
		(async () => {
			try {
				setLoggedIn(true);
				setInitialiseDataFailed(false);
				const res = await api.syncData();
				ctx?.setSyncDataResponse(res);
				onSignIn();
			} catch(e) { 
				setInitialiseDataFailed(true); 
			}
		})();
	}, []);

	return (
		<>
			{!loggedIn ? <Form onSignInSuccess={onSignInSuccess} /> : (
				<Box 
					padding="xl"
					justifyContent="center"
					alignItems="center"
				>
					{initialiseDataFailed ? (
						<>
							<Text
								variant="caption"
								textAlign="center"
								color="error"
							>Failed to setup the app, please try again</Text>

							<Br />

							<Button
								onPress={() => onSignInSuccess()}
							>Try again</Button>
						</>
					) : (
						<>
							<Text
								variant="caption"
								textAlign="center"
							>Logged in. Getting the app ready, please wait...</Text>

							<Br />

							<ActivityIndicator 
								color={theme.colors.primary}
								size={theme.textVariants.title1.fontSize}
							/>
						</>
					)}
				</Box>
			)}			
		</>
	);
}
