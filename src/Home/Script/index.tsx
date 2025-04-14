import React, { useCallback, useMemo, useState } from 'react';
import { useIsFocused } from '@react-navigation/native';
import { generateUID } from '@/src/utils/uid';
import * as types from '../../types';
import { getApplication, getConfiguration, getLocation, getScript } from '../../data';
import { getNavOptions } from './navOptions';
import { useTheme, Text, Box, Modal, OverlayLoader } from '../../components';
import { useBackButton } from '../../hooks/useBackButton';
import * as api from '../../data';

import { Start } from './Start';
import { Screen } from './Screen';
import { Context, MoreNavOptions, ContextType } from './Context';
import { getScriptUtils } from './utils';
import { Alert, TextProps } from 'react-native';
import { Summary } from './Summary';
import { defaultPreferences } from '@/src/constants';

function ScriptComponent({ navigation, route }: types.StackNavigationProps<types.HomeRoutes, 'Script'>) {
	const theme = useTheme();

	const [isReady, setIsReady] = useState(false);
	const [generatedUID, setGeneratedUID] = React.useState('');

	const [shouldConfirmExit, setShoultConfirmExit] = React.useState(false);
	const [shouldReview, setShouldReview] = React.useState(false);
	const [review, setReview] = React.useState(false)
	const [reviewIndex, setReviewIndex] = React.useState(0)
	const [moreNavOptions, setMoreNavOptions] = React.useState<null | MoreNavOptions>(null);

	const [startTime] = React.useState(new Date().toISOString());
	const [refresh, setRefresh] = React.useState(false);

	const [nuidSearchForm, setNuidSearchForm] = React.useState<types.NuidSearchFormField[]>([]);
	const [matched, setMatched] = React.useState<types.MatchedSession | null>(null);
	const [patientDetails, setPatientDetails] = React.useState({
		isTwin: false,
		twinID: '',
	});

	const [mountedScreens, setMountedScreens] = React.useState<{ [id: string]: boolean; }>({});

	const [sessionID, setSessionID] = React.useState<ContextType['sessionID']>(route.params?.session?.id || null);

	const [application, setApplication] = React.useState<null | types.Application>(null);
	const [location, setLocation] = React.useState<null | types.Location>(null);

	const [displayLoader, setDisplayLoader] = React.useState(false);

	const [summary, setSummary] = React.useState<any>(null);

	const [loadingScript, setLoadingScript] = React.useState(false);
	const [script, setScript] = React.useState<null | types.Script>(null);
	const [screens, setScreens] = React.useState<types.Screen[]>([]);
	const [diagnoses, setDiagnoses] = React.useState<types.Diagnosis[]>([]);
	const [drugsLibrary, setDrugsLibrary] = React.useState<types.DrugsLibraryItem[]>([]);
	const [loadScriptError, setLoadScriptError] = React.useState('');

	const [loadingConfiguration, setLoadingConfiguration] = React.useState(false);
	const [configuration, setConfiguration] = React.useState<types.Configuration>({});
	const [, setLoadConfigurationError] = React.useState('');

	const [activeScreen, setActiveScreen] = React.useState<null | types.Screen>(null);
	const [lastPage, setLastPage] = React.useState<null | types.Screen>(null);
	const [lastPageIndex, setLastPageIndex] = React.useState<null | types.Screen>(null);
	const [activeScreenIndex, setActiveScreenIndex] = React.useState((route.params?.session?.data?.form || []).length);

	const [entries, setEntries] = React.useState<types.ScreenEntry[]>(route.params?.session?.data?.form || []);
	const [cachedEntries, setCachedEntries] = React.useState<types.ScreenEntry[]>(route.params?.session?.data?.form || []);
	const setCacheEntry = (entry: types.ScreenEntry) => !entry ? null : setCachedEntries(entries => {
		const isAlreadyEntered = entries.map(e => e.screen.id).includes(entry.screen.id);
		return isAlreadyEntered ? entries.map(e => e.screen.id === entry.screen.id ? entry : e) : [...entries, entry];
	});
	const [reviewConfigurations, setReviewConfigurations] = React.useState<any[]>([]);
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
	const removeEntry = useCallback((screenId: string | number) => {
		setCacheEntry(entries.filter(e => e.screen.id === screenId)[0]);
		setEntries(entries => entries.filter(e => e.screen.id !== screenId));
	}, [entries, setCacheEntry, setEntries]);

	const activeScreenEntry = useMemo(() => entries.filter(e => e.screenIndex === activeScreenIndex)[0], [entries, activeScreenIndex]);

	const utils = getScriptUtils({
		script_id: route.params.script_id,
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
		matchingSession: matched?.session || null,
		session: route.params?.session,
		generatedUID,
		drugsLibrary,
	});

	const saveSession = (params?: any) => new Promise((resolve, reject) => {
		const summary = utils.createSessionSummary(params);
		(async () => {
			try {
				const res = await api.saveSession({
					id: sessionID,
					...summary
				});
				setSessionID(res?.sessionID);
				resolve(summary);
			} catch (e) {

				reject(e);
			}
		})();
	});

	const createSummaryAndSaveSession = (params?: any) => new Promise((resolve, reject) => {
		setDisplayLoader(true);
		(async () => {
			try {
				const summary = await saveSession(params);
				api.exportSessions().then(() => { }).catch(() => { });
				setSummary(summary);
				resolve(summary);
			} catch (e) {

				reject(e);
			}
			setDisplayLoader(false);
		})();
	});

	const loadScript = React.useCallback(async () => {
		try {
			setLoadingScript(true);
			setLoadScriptError('');
			setScript(null);
			setScreens([]);
			setDiagnoses([]);
			setActiveScreen(null);
			setDrugsLibrary([]);

			const { script, screens, diagnoses, } = await getScript({ script_id: route.params.script_id, });
			const drugsLibrary = await api.getDrugsLibrary();

			const uid = await generateUID(script?.type);
			setGeneratedUID(uid);
			setScript(script);
			setScreens(screens);
			setDiagnoses(diagnoses);
			setDrugsLibrary(drugsLibrary.map(d => d.data));
			setLoadingScript(false);
			setReviewConfigurations(script?.data?.reviewConfigurations)
            setShouldReview(script.data?.reviewable)

			if (route.params?.session?.data?.form?.length) {
				const lastEntry = route.params.session.data.form[route.params.session.data.form.length - 1];
				const activeScreenIndex = screens.map((s, i) => {
					if (
						(s.screen_id === lastEntry?.screen?.screen_id) ||
						(s.screenId === lastEntry?.screen?.screen_id)
					) return i;
					return null;
				}).filter(i => i !== null)[0];

				if (lastEntry && activeScreenIndex >= 0) {
					setActiveScreen(screens[activeScreenIndex]);
					setActiveScreenIndex(activeScreenIndex);
				}
			}
		} catch (e: any) {
			console.log(e);
			setLoadScriptError(e.message);
		} finally {
			setLoadingScript(false);
			setIsReady(true);
		}
	}, [navigation, route]);

	const loadConfiguration = React.useCallback(() => {
		(async () => {
			try {
				setLoadingConfiguration(true);
				const configuration = await getConfiguration();
				setConfiguration({ ...configuration?.data });
				setLoadingConfiguration(false);
			} catch (e: any) {

				setLoadConfigurationError(e.message);
			}
		})();
	}, []);

	const confirmExit = () => {
		setShoultConfirmExit(true);
	};

	const goNext = async () => {
		const lastScreen = { ...utils.getLastScreen() };
		const lastScreenIndex = screens.map(s => `${s.id}`).indexOf(`${lastScreen?.id}`);

		const next = utils.getScreen({ direction: 'next' });
		const nextScreen = next?.screen || lastScreen;
		const nextScreenIndex = next?.screen ? next?.index : lastScreenIndex;

		if (summary) {
			navigation.navigate('Home');
			return;
		}
		if(activeScreen.review){
			setReviewIndex(reviewIndex+1)
		}

		if (activeScreen?.id === lastScreen?.id) {
			
			const lastReviewIndex = reviewConfigurations?.length

			if (shouldReview && lastReviewIndex && reviewIndex<lastReviewIndex) {
				setReview(true)
				setLastPage(lastScreen)
				setLastPageIndex(lastScreenIndex)
			} else {
				const summary = await createSummaryAndSaveSession({ completed: true });
				setReview(false)
				setShouldReview(false);
				setSummary(summary);
			}
			
		} else {
			if (nextScreen) {

				if (activeScreen.review) {
					const lastReviewIndex = reviewConfigurations?.length

					setRefresh(true)
					if (shouldReview && lastReviewIndex && reviewIndex<lastReviewIndex){
						setShouldReview(true)
						setReview(true)
					} else{
						setActiveScreenIndex(lastPageIndex);
						lastPage.review = false
						setActiveScreen(lastPage);
						setEntry(cachedEntries.filter(e => `${e.screenIndex}` === `${lastPageIndex}`)[0]);
						setTimeout(() => setRefresh(false), 2);
					}
					

				} else {
					setRefresh(true);
					setEntry(cachedEntries.filter(e => `${e.screenIndex}` === `${nextScreenIndex}`)[0]);
					setActiveScreenIndex(nextScreenIndex);
					setActiveScreen(nextScreen);
					setTimeout(() => setRefresh(false), 10);
					saveSession();
				}

			} else {
				Alert.alert(
					'ERROR',
					'Failed to load next screen. Screen condition might be invalid',
					[
						{
							text: 'Exit',
							onPress: () => navigation.navigate('Home'),
							style: 'cancel'
						},
					]
				);
			}
		}
	};

	const goBack = () => {
		if (summary || !activeScreen) {
			navigation.navigate('Home');
			return;
		}

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
				saveSession();
			}
		}
	};

	const getFieldPreferences = useCallback((field: string, screen = activeScreen) => {
		const preferences = {
			...defaultPreferences,
			...screen?.data?.preferences,
		} as typeof defaultPreferences;

		const fieldPreferences = {
			fontSize: preferences.fontSize[field],
			fontWeight: preferences.fontWeight[field],
			fontStyle: preferences.fontStyle[field] || [],
			textColor: preferences.textColor[field],
			backgroundColor: preferences.backgroundColor[field],
			highlight: preferences.highlight[field],
		};

		const styleObj: { [key: string]: any; } = {
			color: fieldPreferences?.textColor,
			fontStyle: !fieldPreferences.fontStyle.includes('italic') ? undefined : 'italic',
			fontWeight: !fieldPreferences?.fontWeight ? undefined : {
				bold: 900,
			}[fieldPreferences.fontWeight!],
			fontSize: !fieldPreferences?.fontSize ? undefined : {
				xs: 6,
				sm: 12,
				default: undefined,
				lg: 20,
				xl: 26,
			}[fieldPreferences.fontSize!],
		};

		const style = Object.keys(styleObj).reduce((acc, key) => {
			if (styleObj[key] === undefined) return acc;
			return {
				...acc,
				[key]: styleObj[key],
			};
		}, {}) as TextProps['style'];

		return {
			...fieldPreferences,
			style,
		};
	}, [activeScreen]);

	const setNavOptions = React.useCallback(() => {
		navigation.setOptions(getNavOptions({
			script,
			theme,
			activeScreen,
			activeScreenIndex,
			moreNavOptions,
			getFieldPreferences,
			confirmExit,
			goBack: moreNavOptions?.goBack || goBack,
			goNext: moreNavOptions?.goNext || goNext,
		}));
	}, [
		script,
		route,
		navigation,
		theme,
		activeScreen,
		activeScreenIndex,
		moreNavOptions,
		summary,
		getFieldPreferences
	]);

	const handleReviewChange = () => {
        
		let as = reviewConfigurations[reviewIndex]
		if (as) {
			const filtered = screens.find(s=>s.screen_id===as.screen)
		   if(filtered){
			setReview(false)
			setRefresh(true);
			filtered.review=true
            removeEntry(activeScreen?.id);  
            setActiveScreenIndex(screens.indexOf(filtered));
            setActiveScreen(filtered);
            setTimeout(() => setRefresh(false), 2);    
		   }
		}
	}

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

	const getEntryValueByKey = React.useCallback((key: string) => {
		key = `${key || ''}`.replace('$', '');
		let value: null | types.ScreenEntryValue = null;
		entries.forEach(e => e.values.forEach(v => {
			if (`${v.key}`.toLowerCase() === `${key}`.toLowerCase()) {
				value = v;
			}
		}));
		return value;
	}, [entries]);

	const getBirthFacilities = (): any[] => {
		// ["ReferredFrom", 'BirthFacility']
		const s = screens.filter(s => ['BirthFacility'].includes(s?.data?.metadata?.key))[0]
		return (s?.data?.metadata?.items || []);
	};

	const handleReviewNoPress = async() => {
		const lastReviewIndex = reviewConfigurations?.length
      setReviewIndex(reviewIndex+1)
	  const rIndex =reviewIndex+1
	  if (shouldReview && rIndex && rIndex<lastReviewIndex){
		setShouldReview(true)
		setReview(true)
	} else{
		setShouldReview(false)
		setReview(false)
	}
	
	};

	const handleReviewYesPress = () => {
		handleReviewChange();
	};
	const closeReviewModal = () =>{
		setReview(false)
		setShouldReview(false)
	}

	if (refresh) return null;

	if (loadingConfiguration || loadingScript || !isReady) return <OverlayLoader transparent={false} />;

	if (loadScriptError) {
		return (
			<Modal
				open
				onClose={() => { }}
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

	if (!(script && application)) return null;

	return (
		<Context.Provider
			value={{
				...utils,
				generatedUID,
				script,
				screens,
				drugsLibrary,
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
				summary,
				matched,
				mountedScreens,
				sessionID,
				script_id: route.params.script_id,
				patientDetails,
				nuidSearchForm,
				getFieldPreferences,
				setNuidSearchForm,
				setPatientDetails,
				saveSession,
				createSummaryAndSaveSession,
				setSessionID,
				setMountedScreens,
				setMatched,
				getBirthFacilities,
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
				getEntryValueByKey,
				getRepeatablesPrepopulation() {
					try {
						const autoFill = nuidSearchForm?.[0]?.results?.session?.data?.entries?.repeatables
							?? nuidSearchForm?.[0]?.results?.autoFill?.data?.entries?.repeatables;

						if (autoFill && typeof autoFill === 'object') {
							return autoFill
						}

						return null;
					} catch {
						return null;
					}
				},
				getPrepopulationData(prePopulationRules?: string[]) {

					const results = nuidSearchForm
						.filter(f => f.results)
						.filter(f => {
							const metadata = activeScreen.data.metadata;
							const fields: any[] = metadata.fields || [];
							const items: any[] = metadata.items || [];

							const canPrePopulate = (rules: string[]) => {
								const prePopulate = rules;
								if (!prePopulate.length) return false;
								if (prePopulate.includes('allSearches')) return true;
								const isTwinSearch = f.key === 'BabyTwinNUID';
								if (!prePopulate.includes('twinSearches') && isTwinSearch) return false;
								return true;
							};

							let isPrePopulatable = canPrePopulate(prePopulationRules || activeScreen.data.prePopulate || activeScreen.data.metadata.prePopulate || []);

							fields.forEach(f => {
								const isTrue = canPrePopulate(f.prePopulate || []);
								if (isTrue) isPrePopulatable = true;
							});

							items.forEach(f => {
								const isTrue = canPrePopulate(f.prePopulate || []);
								if (isTrue) isPrePopulatable = true;
							});

							return isPrePopulatable;
						});
					const twin = results.filter(item => item.key === 'BabyTwinNUID')[0];
					return {
						...results.reduce((acc, item) => ({
							...acc,
							...item?.results?.autoFill?.data?.entries,
						}), {}),
						...twin?.results?.autoFill?.data?.entries,
					};
				},
				setEntryValues: (values?: types.ScreenEntry['values'], otherValues?: any) => {
					// setMountedScreens(prev => ({
					// 	...prev,
					// 	[activeScreen.id]: true,
					// }));	

					if (values) {
						const screenMeta = activeScreen.data.metadata;
						setEntry({
							values,
							prePopulate: activeScreen?.data?.prePopulate,
							screenIndex: activeScreenIndex,
							management: [],
							// management: screens
							// 	.filter(s => [activeScreen?.data?.refId, activeScreen?.data?.metadata?.key, `$${activeScreen?.data?.metadata?.key}`].includes(`${s.data?.refKey}`))
							// 	.map(s => s.data)
							// 	.filter(s => s.printable),
							screen: {
								title: activeScreen.data.title,
								sectionTitle: activeScreen.data.sectionTitle,
								id: activeScreen.id,
								screen_id: activeScreen.screen_id,
								type: activeScreen.type,
								metadata: {
									label: screenMeta.label,
									dataType: screenMeta.dataType,
									title1: screenMeta.title1,
									text1: screenMeta.text1,
									image1: screenMeta.image1,
									title2: screenMeta.title2,
									text2: screenMeta.text2,
									image2: screenMeta.image2,
									title3: screenMeta.title3,
									text3: screenMeta.text3,
									image3: screenMeta.image3,
								},
								index: activeScreenIndex,
							},
							...otherValues
						});
					} else {
						removeEntry(activeScreen.id,);
					}
				},
			}}
		>
			<>
				{(() => {
					if (summary) return <Summary />;

					return (
						<>
							<Box flex={1} paddingBottom="m" backgroundColor="white">
								{!activeScreen ? (
									<Start />
								) : (
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
												await createSummaryAndSaveSession({ cancelled: true, });
												navigation.navigate('Home');
												setShoultConfirmExit(false);
											})();
										}
									},
								]}
							>
								<Text>Are you sure you want to cancel script?</Text>
							</Modal>
							<Modal
								open={shouldReview && review}
								onClose={() => {closeReviewModal()}}
								title="Review Screens"
								actions={[
									{
	                                    color:'error',
										label: 'Skip',
										onPress: handleReviewNoPress,
									},
									{
										color:'secondary',
										label: 'Go To',
										onPress: handleReviewYesPress,
									
									},
								]}
							>
									<Text style={{ fontSize: 20, fontWeight: 'bold', color: 'maroon' }}>
										{reviewConfigurations?.[reviewIndex]?.label  ||''}
									</Text>
							</Modal>

						</>
					);
				})()}

				{displayLoader && <OverlayLoader />}
			</>
		</Context.Provider>
	);
}

export function Script(props: types.StackNavigationProps<types.HomeRoutes, 'Script'>) {
	const isFocused = useIsFocused();
	return !isFocused ? null : <ScriptComponent {...props} />;
}
