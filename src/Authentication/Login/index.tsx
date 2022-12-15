import React from 'react';
import { ActivityIndicator } from 'react-native';
import { Box, Br, Text, useTheme, Button  } from "../../components";
import { Container } from '../Container';
import { AppRoutes, StackNavigationProps } from '../../types';
import { Form } from './Form';
import { initialiseData } from '../../data';

export function Login({ navigation }: StackNavigationProps<AppRoutes, 'Authentication'>) {
	const theme = useTheme();
	const [loggedIn, setLoggedIn] = React.useState(false);
	const [initialiseDataFailed, setInitialiseDataFailed] = React.useState(false);

	const onLoginSuccess = React.useCallback(() => {
		(async () => {
			try {
				setLoggedIn(true);
				setInitialiseDataFailed(false);
				await initialiseData();
				// navigation.navigate('Home');
			} catch(e) { 
				console.log(e);
				setInitialiseDataFailed(true); 
			}
		})();
	}, []);

	return (
		<Container>
			{!loggedIn ? <Form onLoginSuccess={onLoginSuccess} /> : (
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
								onPress={() => onLoginSuccess()}
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
		</Container>
	);
}
