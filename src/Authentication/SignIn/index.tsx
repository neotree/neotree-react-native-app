import React from 'react';
import { ActivityIndicator } from 'react-native';
import { Box, Br, Text, useTheme, Button  } from "../../components";
import { Form } from './Form';
import { getApplication, getAuthenticatedUser, syncData } from '../../data';
import { useAppContext } from '../../AppContext';
import { logError } from '@/src/utils/logError';

type SignInProps = { onSignIn: () => void; };

export function SignIn({ onSignIn }: SignInProps) {
	const {setSyncDataResponse} = useAppContext()||{};
	const theme = useTheme();

	const [loggedIn, setLoggedIn] = React.useState(false);
	const [initialiseDataFailed, setInitialiseDataFailed] = React.useState(false);

	const onSignInSuccess = React.useCallback(() => {
		(async () => {
			try {
				setLoggedIn(true);
				setInitialiseDataFailed(false);
				const [user, app] = await Promise.all([getAuthenticatedUser(), getApplication()]);
				if (user && app?.webeditor_info?.version) {
					setSyncDataResponse?.({ authenticatedUser: user, application: app, last_sync_date: app.last_sync_date });
					onSignIn();
					syncData()
						.then(res => setSyncDataResponse?.(res))
						.catch(e => logError('SignIn.backgroundSync', e));
					return;
				}
				const res = await syncData();
				setSyncDataResponse &&setSyncDataResponse(res);
				onSignIn();
			} catch(e) { 
				logError('SignIn.initialise', e);
				setInitialiseDataFailed(true); 
			}
		})();
	}, [onSignIn, setSyncDataResponse]);

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

							<Br spacing='s'/>

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

							<Br spacing='s'/>

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
