import React from 'react';
import { useIsFocused } from '@react-navigation/native';
import * as types from '../../types';
import { getApplication, getConfiguration, getLocation, getScript } from '../../data';
import { getNavOptions } from './navOptions';
import { useTheme, Text, Box, Modal } from '../../components';
import { useBackButton } from '../../hooks/useBackButton';

import { Start } from './Start';
import { Screen } from './Screen';
import { Context, MoreNavOptions } from './Context';
import { getScriptUtils } from './utils';

function ScriptComponent({ navigation, route }: types.StackNavigationProps<types.HomeRoutes, 'Script'>) {
	const theme = useTheme();

	const [shouldConfirmExit, setShoultConfirmExit] = React.useState(false);
	const [moreNavOptions, setMoreNavOptions] = React.useState<null | MoreNavOptions>(null);

	const [startTime] = React.useState(new Date().toISOString());
	const [refresh, setRefresh] = React.useState(false);

	const [application, setApplication] = React.useState<null | types.Application>(null);
	const [location, setLocation] = React.useState<null | types.Location>(null);

	const [loadingScript, setLoadingScript] = React.useState(false);
	const [script, setScript] = React.useState<null | types.Script>(null);
	const [screens, setScreens] = React.useState<types.Screen[]>([]);
	const [diagnoses, setDiagnoses] = React.useState<types.Diagnosis[]>([]);
	const [loadScriptError, setLoadScriptError] = React.useState('');

	const [loadingConfiguration, setLoadingConfiguration] = React.useState(false);
	const [configuration, setConfiguration] = React.useState<types.Configuration>({});
	const [, setLoadConfigurationError] = React.useState('');

	const [activeScreen, setActiveScreen] = React.useState<null | types.Screen>(null);
	const [activeScreenIndex, setActiveScreenIndex] = React.useState(0);

	const [entries, setEntries] = React.useState<types.ScreenEntry[]>([]);
  	const [cachedEntries, setCachedEntries] = React.useState<types.ScreenEntry[]>([]);
	const setCacheEntry = (entry: types.ScreenEntry) => !entry ? null : setCachedEntries(entries => {
		const isAlreadyEntered = entries.map(e => e.screen.id).includes(entry.screen.id);
		return isAlreadyEntered ? entries.map(e => e.screen.id === entry.screen.id ? entry : e) : [...entries, entry];
	});
	const getCachedEntry = (screenIndex: number): types.ScreenEntry | undefined => cachedEntries.filter(e => `${e.screenIndex}` === `${screenIndex}`)[0];
	const setEntry = (entry?: types.ScreenEntry) => {
		if (entry) {
			setEntries(entries => {
				const isAlreadyEntered = entries.map(e => `${e.screen.id}`).includes(`${entry.screen.id}`);
				return (isAlreadyEntered ? entries.map(e => `${e.screen.id}` === `${entry.screen.id}` ? entry : e) : [...entries, entry]);
			});
			setCacheEntry(entry);
		}
	};
	const removeEntry = (screenId: string | number) => {
		setCacheEntry(entries.filter(e => e.screen.id === screenId)[0]);
		setEntries(entries => entries.filter(e => e.screen.id !== screenId));
	};
	const activeScreenEntry = entries.filter(e => e.screenIndex === activeScreenIndex)[0];

	const utils = getScriptUtils({
		script,
		activeScreen,
		activeScreenIndex,
		screens,
		diagnoses,
		entries,
		cachedEntries,
		activeScreenEntry,
		configuration,
		location,
		application,
		startTime,
	});

	const loadScript = React.useCallback(() => {
		(async () => {
			try {
				setLoadingScript(true);
				setLoadScriptError('');
				setScript(null);
				setScreens([]);
				setDiagnoses([]);
				setActiveScreen(null);

				const { script, screens, diagnoses, } = await getScript({ script_id: route.params.script_id, });
				
				setScript(script);
				setScreens(
					screens
						.filter(s => s.type === 'diagnosis')
				);
				setDiagnoses(diagnoses);
				setLoadingScript(false);
			} catch (e: any) { console.log(e); setLoadScriptError(e.message); }
		})();
	}, [navigation, route]);

	const loadConfiguration = React.useCallback(() => {
		(async () => {
			try {
				setLoadingConfiguration(true);
				const configuration = await getConfiguration();				
				setConfiguration({ ...configuration?.data });
				setLoadingConfiguration(false);
			} catch (e: any) { console.log(e); setLoadConfigurationError(e.message); }
		})();
	}, []);

	const confirmExit = () => {
		setShoultConfirmExit(true);
	};

	const goNext = () => {
		const next = utils.getScreen({ direction: 'next' });
		if (next?.screen) {
			setRefresh(true);
			setEntry(cachedEntries.filter(e => `${e.screenIndex}` === `${next.index}`)[0]);			
			setActiveScreenIndex(next.index);
			setActiveScreen(next.screen);
			setTimeout(() => setRefresh(false), 10);
		}
	};

	const goBack = () => {
		if (activeScreenIndex === 0) {
			confirmExit();
		} else {
			const prev = utils.getScreen({ direction: 'back' });
			if (prev?.screen) {
				setRefresh(true);
				removeEntry(activeScreen?.id);
				// setEntry(getCachedEntry(prev.index));				
				setActiveScreenIndex(prev.index);
				setActiveScreen(prev.screen);
				setTimeout(() => setRefresh(false), 10);
			}
		}
	};

	const setNavOptions = React.useCallback(() => {
		navigation.setOptions(getNavOptions({ 
			script, 
			theme, 
			confirmExit, 
			activeScreen, 
			activeScreenIndex,
			goBack: moreNavOptions?.goBack || goBack,
			moreNavOptions,
		}));
	}, [script, route, navigation, theme, activeScreen, activeScreenIndex, moreNavOptions]);

	React.useEffect(() => {
        (async () => {
            const app = await getApplication();
            setApplication(app);

			const location = await getLocation();
			setLocation(location);

			loadConfiguration();
			loadScript(); 
        })();
    }, []);

	React.useEffect(() => { setNavOptions(); }, [script, activeScreen, moreNavOptions]);

	useBackButton(() => { 
		if (moreNavOptions?.goBack) {
			moreNavOptions.goBack();
		} else {
			goBack(); 
		}
	});

	if (loadingConfiguration || loadingScript || refresh) return null;

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

	if (!(script || application)) return null;

	return (
		<Context.Provider
			value={{
				script,
				screens,
				diagnoses,
				activeScreen,
				activeScreenIndex,
				navigation,
				entries,
				cachedEntries,
				activeScreenEntry,
				configuration,
				application,
				location,
				moreNavOptions,
				...utils,
				setMoreNavOptions,
				setNavOptions,
				setActiveScreen,
				setActiveScreenIndex,
				setCachedEntries,
				setEntries,
				goNext,
				goBack,
				setCacheEntry,
				getCachedEntry,
				setEntry,
				removeEntry,
				setEntryValues: (values?: types.ScreenEntry['values']) => {					
					if (values) {
						const { label, dataType } = activeScreen.data.metadata;
						setEntry({
							values,
							screenIndex: activeScreenIndex,
							screen: {
								title: activeScreen.data.title,
								sectionTitle: activeScreen.data.sectionTitle,
								id: activeScreen.id,
								screen_id: activeScreen.screen_id,
								type: activeScreen.type,
								metadata: { label, dataType },
							}
						});
					} else {
						removeEntry(activeScreen.id,);
					}
				},
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

export function Script(props: types.StackNavigationProps<types.HomeRoutes, 'Script'>) {
	const isFocused = useIsFocused();
	return !isFocused ? null : <ScriptComponent {...props} />;
}
