import React from 'react';
import { useIsFocused } from '@react-navigation/native';
import * as types from '../../types';
import { getScript } from '../../data';
import { getNavOptions } from './navOptions';
import { useTheme, Text, Box, Modal } from '../../components';
import { useBackButton } from '../../hooks/useBackButton';

import { Start } from './Start';
import { Screen } from './Screen';
import { Context } from './Context';

export function Script({ navigation, route }: types.StackNavigationProps<types.HomeRoutes, 'Script'>) {
	const { screen_id } = route.params;
	const isFocused = useIsFocused();

	const theme = useTheme();

	const [loadingScript, setLoadingScript] = React.useState(false);
	const [script, setScript] = React.useState<null | types.Script>(null);
	const [screens, setScreens] = React.useState<types.Screen[]>([]);
	const [diagnoses, setDiagnoses] = React.useState<types.Diagnosis[]>([]);
	const [loadScriptError, setLoadScriptError] = React.useState('');

	const [activeScreen, setActiveScreen] = React.useState<null | types.Screen>(null);
	const [activeScreenIndex, setActiveScreenIndex] = React.useState(0);

	const [shouldConfirmExit, setShoultConfirmExit] = React.useState(false);

	const loadScript = React.useCallback(() => {
		(async () => {
			try {
				setLoadingScript(true);
				setLoadScriptError('');
				setScript(null);
				setScreens([]);
				setDiagnoses([]);
				setActiveScreen(null);
				setActiveScreenIndex(0);

				const { script, screens, diagnoses, } = await getScript({ script_id: route.params.script_id, });
				
				setScript(script);
				setScreens(screens.filter(s => s.type === 'progress'));
				setDiagnoses(diagnoses);
				setActiveScreenIndex(0);
				setLoadingScript(false);
			} catch (e: any) { console.log(e); setLoadScriptError(e.message); }
		})();
	}, [navigation, route]);

	const confirmExit = React.useCallback(() => {
		setShoultConfirmExit(true);
	}, [activeScreenIndex]);

	const goNext = React.useCallback(() => {
		const nextIndex = activeScreenIndex + 1;
		const nextScreen = screens[nextIndex];
		if (nextScreen) {
			navigation.navigate('Script', {
				...route.params,
				screen_id: nextScreen.screen_id,
			});
		}
	}, [activeScreenIndex, screens, navigation, route]);

	const goBack = React.useCallback(() => {
		if (activeScreenIndex === 0) {
			confirmExit();
		} else {
			const prevIndex = activeScreenIndex - 1;
			const prevScreen = screens[prevIndex];
			if (prevScreen) {
				navigation.navigate('Script', {
					...route.params,
					screen_id: prevScreen.screen_id,
				});
			}
		}
	}, [activeScreenIndex, screens, navigation, route]);

	const setNavOptions = React.useCallback(() => {
		navigation.setOptions(getNavOptions({ 
			script, 
			theme, 
			confirmExit, 
			activeScreen, 
			activeScreenIndex,
			goBack,
		}));
	}, [script, route, navigation, theme, activeScreen, activeScreenIndex]);

	React.useEffect(() => { if (isFocused) loadScript(); }, [isFocused]);

	React.useEffect(() => { if (isFocused) setNavOptions(); }, [isFocused, script, activeScreen]);

	React.useEffect(() => {
		if (screen_id) {
			screens.forEach((s, i) => {
				if (s.screen_id === screen_id) {
					setActiveScreen(s);
					setActiveScreenIndex(i);
				}
			});
		}
	}, [screen_id, screens]);

	useBackButton(() => { goBack(); });

	if (loadScriptError) {
		return (
			<Modal
				open
				onClose={() => {}}
				title="Error"
				actions={[
					{
						label: 'Exit',
						onPress: () => navigation.navigate('Home'),
					},
					{
						label: 'Try again',
						onPress: () => loadScript,
					},
				]}
			>
				<Text>{loadScriptError}</Text>
			</Modal>
		)
	}

	if (!script) return null;

	return (
		<Context.Provider
			value={{
				script,
				screens,
				diagnoses,
				activeScreen,
				activeScreenIndex,
				navigation,
				goNext,
				goBack,
			}}
		>
			<>
				<Box flex={1} paddingBottom="m" backgroundColor="white">
					{!activeScreen ? (
						<Start /> 
					): (
						<Screen />
					)}
				</Box>

				<Modal 
					open={shouldConfirmExit} 
					onClose={() => setShoultConfirmExit(false)}
					title="Cancel Script?"
					actions={[
						{
							label: 'Cancel',
							onPress: () => setShoultConfirmExit(false),
						},
						{
							label: 'Yes',
							onPress: () => {
								(async () => {
									// save first
									navigation.navigate('Home');
									setShoultConfirmExit(false);
								})();
							}
						},
					]}
				>
					<Text>Are you sure you want to cancel script?</Text>
				</Modal>
			</>
		</Context.Provider>
	);
}
