import React from 'react';
import { ActivityIndicator } from 'react-native';
import { Box, Br, Text, useTheme, Button  } from "../../components";
import { Form } from './Form';
import { syncData } from '../../data';
import { useAppContext } from '../../AppContext';
import { tryApplyUpdateFlowAfterSync } from '../../update';

type SignInProps = { onSignIn: () => void; };

export function SignIn({ onSignIn }: SignInProps) {
	const {setSyncDataResponse, setUpdateDecision} = useAppContext()||{};
	const theme = useTheme();

	const [loggedIn, setLoggedIn] = React.useState(false);
	const [initialiseDataFailed, setInitialiseDataFailed] = React.useState(false);

	const onSignInSuccess = React.useCallback(() => {
		(async () => {
			try {
				setLoggedIn(true);
				setInitialiseDataFailed(false);
				const res = await syncData();
				setSyncDataResponse &&setSyncDataResponse(res);
				onSignIn();
				if (setUpdateDecision) {
					tryApplyUpdateFlowAfterSync()
						.then((decision) => {
							if (decision) setUpdateDecision(decision);
						})
						.catch(() => null);
				}
			} catch(e) { 
				console.log(e);
				setInitialiseDataFailed(true); 
			}
		})();
	}, [onSignIn, setSyncDataResponse, setUpdateDecision]);

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
