import React from 'react';
import { useIsFocused } from '@react-navigation/native';
import { Alert, Platform, TouchableOpacity, FlatList, View } from "react-native";
import * as MediaLibrary from 'expo-media-library';
import Icon from '@expo/vector-icons/MaterialIcons';
import moment from 'moment';
import * as types from '../../types';
import * as api from '../../data';
import { Box, Text, Modal, DatePicker, Br, Radio, Content, Card, OverlayLoader, useTheme, TextInput } from '@/src/components';
import exportData from './export';
import { Session } from './Session';

const exportTypes = [
	{
		label: 'All completed sessions',
		value: 'completed',
	},
	{
		label: 'Date range (completed sessions)',
		value: 'date_range',
	},
];

const deleteTypes = [
	{
		label: 'All (except unexported complete sessions)',
		value: 'all',
	},
	{
		label: 'Incomplete sessions',
		value: 'incomplete',
	},
	{
		label: 'Date range',
		value: 'date_range',
	},
];

const exportFormats = [
	{ label: 'Excel Spreadsheet', value: 'excel' },
	{ label: 'JSON (Save to Tablet)', value: 'json' },
	{ label: 'JSONAPI (Send to Database)', value: 'jsonapi' },
];

export function Sessions({ navigation }: types.StackNavigationProps<types.HomeRoutes, 'Sessions'>) {
	const theme = useTheme();

	const isFocused = useIsFocused();

	const [pageInitialised, setPageInitialised] = React.useState(false);

	const [application, setApplication] = React.useState<null | types.Application>(null);

	const [openExportModal, setOpenExportModal] = React.useState(false);
	const [openFilterModal, setOpenFilterModal] = React.useState(false);
	const [openDeleteModal, setOpenDeleteModal] = React.useState(false);

	const [minDate, setMinDate] = React.useState<null | Date>(null);
	const [maxDate, setMaxDate] = React.useState<null | Date>(null);
	const [filterByDate, setFilterByDate] = React.useState(false);

	const [deleteType, setDeleteType] = React.useState(deleteTypes[0].value);
	const [deletingSessions, setDeletingSessions] = React.useState(false);

	const [exportType, setExportType] = React.useState(exportTypes[0].value);
	const [exportFormat, setExportFormat] = React.useState(exportFormats[0].value);
	const [showExportFormats, setShowExportFormats] = React.useState(false);
	const [exportingSessions, setExportingSessions] = React.useState(false);

	const [sessions, setSessions] = React.useState([]);
	const [dbSessions, setDBSessions] = React.useState([]);
	const [loadingSessions, setLoadingSessions] = React.useState(false);
	const [scriptsFields, setScriptsFields] = React.useState({});

	const [selectedSession, setSelectedSession] = React.useState<any>(null);

    const [searchValue, setSearchValue] = React.useState('');
    const searchTimeout = React.useRef<any>();
	const [localServerAvailable, setLocalServerAvailable] = React.useState(false);
	const [localServerChecked, setLocalServerChecked] = React.useState(false);
	const [searchingLocalServer, setSearchingLocalServer] = React.useState(false);
	const [localServerError, setLocalServerError] = React.useState('');
	const [searchSource, setSearchSource] = React.useState<null | 'local' | 'localServer'>(null);
	const [loadingSessionDetails, setLoadingSessionDetails] = React.useState(false);

	const normalizeSessionForDisplay = async (session: any) => {
		if (!session) return session;
		if (session?.data?.form && Array.isArray(session.data.form)) return session;
		const entries = session?.data?.entries || {};
		const repeatables = entries.repeatables || {};
		const entriesByKey = Object.keys(entries).reduce((acc: any, key: string) => {
			acc[key.toLowerCase()] = { entry: entries[key], originalKey: key };
			return acc;
		}, {});
		const buildValueObjects = (labels: any, values: any) => {
			const labelArr = Array.isArray(labels) ? labels : [labels];
			const valueArr = Array.isArray(values) ? values : [values];
			const maxLen = Math.max(labelArr.length, valueArr.length, 1);
			return Array.from({ length: maxLen }).map((_, i) => ({
				valueText: labelArr[i] ?? valueArr[i] ?? 'N/A',
				value: valueArr[i] ?? labelArr[i] ?? 'N/A',
			}));
		};

		const scriptId =
			session?.data?.script?.id ||
			session?.data?.script?.script_id ||
			session?.data?.scriptTitle ||
			session?.scriptid;

		let screens: any[] = [];
		let scriptMeta: any = session?.data?.script;
		try {
			if (scriptId) {
				const scriptRes: any = await api.getScript({ script_id: scriptId });
				scriptMeta = scriptRes?.script || scriptMeta;
				screens = scriptRes?.screens || [];
			}
		} catch {
			screens = [];
		}

		if (scriptId) {
			try {
				const keys = Object.keys(entries).filter((key) => key !== 'repeatables');
				const aliasPairs = await Promise.all(
					keys.map(async (key) => {
						const aliasRes: any = await api.getAliasKeyFromAliasAndScript({
							script: scriptId,
							alias: key,
						});
						return { key, alias: aliasRes?.name };
					})
				);
				aliasPairs.forEach(({ key, alias }) => {
					if (!alias) return;
					const aliasKey = `${alias}`.toLowerCase();
					if (!entriesByKey[aliasKey]) {
						entriesByKey[aliasKey] = entriesByKey[`${key}`.toLowerCase()];
					}
				});
			} catch {
				// ignore alias lookup failures
			}
		}

		const usedKeys = new Set<string>();
		const form: any[] = [];

		const pushScreenEntry = (screen: any, values: any[], repeatableGroup?: any) => {
			if (!values.length && !repeatableGroup) return;
			form.push({
				screen: {
					id: screen?.id || screen?.screen_id || screen?.data?.id || 'historic',
					screen_id: screen?.screen_id || screen?.id || 'historic',
					type: screen?.type || screen?.data?.type || 'form',
					metadata: screen?.data?.metadata || { label: screen?.data?.title || 'Historic Data' },
					title: screen?.data?.title || screen?.data?.metadata?.label || 'Historic Data',
					sectionTitle: screen?.data?.sectionTitle || screen?.data?.metadata?.label || 'Historic Data',
					listStyle: screen?.data?.listStyle,
					printDisplayColumns: screen?.data?.printDisplayColumns,
				},
				values,
				...(repeatableGroup ? { repeatables: repeatableGroup } : {}),
			});
		};

		const buildValueFromEntry = (key: string, entry: any, fieldDef?: any) => {
			if (!entry) return null;
			const entryValues = entry.values || {};
			const valueObjects = buildValueObjects(entryValues.label, entryValues.value);
			const isMulti = valueObjects.length > 1;
			const label = fieldDef?.label || entry.label || key;
			const valuePayload = isMulti
				? valueObjects.map((v) => ({
						value: v.value,
						valueText: v.valueText,
						parentKey: key,
					}))
				: valueObjects[0]?.value ?? 'N/A';
			const valueTextPayload = isMulti ? valuePayload : valueObjects[0]?.valueText ?? 'N/A';
			return {
				key,
				type: fieldDef?.type || entry.type || 'text',
				label,
				value: valuePayload,
				valueText: valueTextPayload,
				dataType: fieldDef?.dataType,
				unit: fieldDef?.unit,
				parentKey: entry.parentKey || fieldDef?.parentKey || '',
				printable: entry.printable !== false && fieldDef?.printable !== false,
				prePopulate: entry.prePopulate || fieldDef?.prePopulate || [],
				confidential: fieldDef?.confidential,
				comments: entry.comments || [],
			};
		};

		const diagnosesList = Array.isArray(session?.data?.diagnoses) ? session.data.diagnoses : [];
		const diagnosesMap = diagnosesList.reduce((acc: any, item: any) => {
			const key = Object.keys(item || {})[0];
			if (!key) return acc;
			acc[key] = item[key];
			return acc;
		}, {});
		const diagnosisKeys = Object.keys(diagnosesMap).sort((a, b) => {
			const pa = diagnosesMap[a]?.Priority ?? Number.MAX_SAFE_INTEGER;
			const pb = diagnosesMap[b]?.Priority ?? Number.MAX_SAFE_INTEGER;
			return pa - pb;
		});

		if (screens.length) {
			screens.forEach((screen) => {
				const metadata = screen?.data?.metadata || {};
				const fields = (metadata.fields || []).map((f: any) => ({ ...f, _source: 'field' }));
				const items = (metadata.items || []).map((f: any) => ({ ...f, _source: 'item' }));
				const defs = [...fields, ...items];

				const screenKeys = defs
					.map((f: any) => f.key || f.value)
					.filter((k: any) => k);

				const values: any[] = [];
				if (screen?.type === 'diagnosis') {
					diagnosisKeys.forEach((key) => {
						const d = diagnosesMap[key];
						values.push({
							key,
							type: 'diagnosis',
							label: d?.diagnosis || key,
							value: d?.diagnosis || key,
							valueText: d?.diagnosis || key,
							diagnosis: {
								name: d?.diagnosis || key,
								how_agree: d?.hcw_agree,
								value: d?.value,
								hcw_follow_instructions: d?.hcw_follow_instructions,
								suggested: d?.Suggested,
								priority: d?.Priority,
								hcw_reason_given: d?.hcw_reason_given,
							},
							printable: true,
						});
						usedKeys.add(key);
					});
				} else {
					screenKeys.forEach((key: string) => {
						const entryKey = `${key}`.toLowerCase();
						const entryMatch = entriesByKey[entryKey];
						if (!entryMatch) return;
						const fieldDef = defs.find((d: any) => {
							const defKey = `${d.key || d.value || ''}`.toLowerCase();
							return defKey === entryKey;
						});
						const val = buildValueFromEntry(entryMatch.originalKey, entryMatch.entry, fieldDef);
						if (val) {
							values.push(val);
							usedKeys.add(entryMatch.originalKey);
						}
					});

					// Non-form screens often use metadata.key instead of fields/items
					if (!screenKeys.length && metadata?.key) {
						const metaKey = `${metadata.key}`.toLowerCase();
						const entryMatch = entriesByKey[metaKey];
						if (entryMatch) {
							const val = buildValueFromEntry(entryMatch.originalKey, entryMatch.entry, {
								key: metadata.key,
								label: metadata.label,
								type: metadata.type || screen?.type,
								dataType: metadata.dataType,
								printable: screen?.data?.printable,
								confidential: metadata.confidential,
							});
							if (val) {
								values.push(val);
								usedKeys.add(entryMatch.originalKey);
							}
						}
					}
				}

				const repeatableGroup =
					metadata?.repeatable && metadata?.collectionName
						? repeatables?.[metadata.collectionName]
						: null;

				pushScreenEntry(screen, values, repeatableGroup);
			});
		}

		const remainingKeys = Object.keys(entries).filter((key) => key !== 'repeatables' && !usedKeys.has(key));
		if (remainingKeys.length && __DEV__) {
			console.log('[Sessions][normalizeSessionForDisplay] Unmapped keys:', remainingKeys);
		}

		if (Object.keys(repeatables).length) {
			const alreadyHandled = screens.some((s) => s?.data?.metadata?.repeatable);
			if (!alreadyHandled) {
				form.push({
					screen: {
						id: 'historic-repeatables',
						screen_id: 'historic-repeatables',
						type: 'form',
						metadata: { label: 'Historic Data' },
						title: 'Historic Data',
						sectionTitle: 'Historic Data',
					},
					values: [],
					repeatables,
				});
			}
		}

		return {
			...session,
			uid: session?.uid || session?.data?.uid,
			data: {
				...session.data,
				script: scriptMeta || session?.data?.script,
				form,
			},
		};
	};

	const exportSessions = async (opts: any = {}) => {
		const _dbSessions = dbSessions.filter((s: any) => s?.data?.completed_at);
		let sessions = _dbSessions;
		switch (exportType) {
			case 'date_range':
				sessions = getFilteredSessions(_dbSessions, { minDate, maxDate }).map((s: any) => s.id) as any;
				break;
			default:
				// do nothing
		}
		setExportingSessions(true);
		try {
			await exportData({ ...opts, format: exportFormat, sessions, scriptsFields, application, });
			if (exportFormat === 'jsonapi') await getSessions();
			Alert.alert(
				'',
				'Export success',
				[
					{
						text: 'Ok',
					}
				]
			);
		} catch (e: any) {
			if (exportFormat === 'excel') {
				console.error('Excel export failed from Sessions screen', {
					exportType,
					sessionCount: Array.isArray(sessions) ? sessions.length : 0,
					error: e,
				});
			}
			Alert.alert(
				'Failed to export data',
				e.message || e.msg || JSON.stringify(e),
				[
					{
						text: 'Try again',
						onPress: () => exportSessions({ dontSaveFile: true, })
					},
					{
						text: 'Cancel',
					}
				]
			);
			
		}
		setExportingSessions(false);
		setShowExportFormats(false);
	};

	const deleteSessions = async (ids: any[] = []) => {
		if (ids.length) {
			setDeletingSessions(true);
			try {
				await api.deleteSessions(ids);
				await getSessions();
			} catch (e: any) {
				Alert.alert(
				'ERROR',
				e.message || e.msg || JSON.stringify(e),
				[
					{
						text: 'Try again',
						onPress: () => deleteSessions(ids),
					},
					{
						text: 'Cancel',
						onPress: () => {},
					}
				]
				);
				
			}
			setDeletingSessions(false);
		}
	};

	React.useEffect(() => {
		navigation.setOptions({
			title: 'Session History',
			headerLeft: ({ tintColor }) => (
				<Box marginLeft="m">
					<TouchableOpacity 
						onPress={() => {
							if (selectedSession) {
								setSelectedSession(null);
							} else {
								navigation.navigate('Home');
							}
						}}
					>
						<Icon 
							name={Platform.OS === 'ios' ? 'arrow-back-ios' : 'arrow-back'}  
							size={28} 
							color={tintColor}
						/>
					</TouchableOpacity>
				</Box>
			),
			headerRight: ({ tintColor }) => (
				<Box marginRight="m" flexDirection="row" alignItems="center">
					<Box marginLeft="m">
						<TouchableOpacity onPress={() => setOpenFilterModal(true)}>
							<Text style={{ color: tintColor }}>Filter</Text>
						</TouchableOpacity>
					</Box>

					<Box marginLeft="m">
						<TouchableOpacity onPress={() => setOpenExportModal(true)}>
							<Icon 
								name="save"
								size={28} 
								color={tintColor}
							/>
						</TouchableOpacity>
					</Box>

					<Box marginLeft="m">
						<TouchableOpacity onPress={() => setOpenDeleteModal(true)}>
							<Icon 
								name="delete"
								size={28} 
								color={tintColor}
							/>
						</TouchableOpacity>
					</Box>
				</Box>
			),
		});
	}, [navigation, selectedSession]);

	const getFilteredSessions = (sessions = dbSessions, filters?: any) => {
		let _sessions = [...sessions];

		const getParsedDate = (d: any) => {
			d = moment(d).format('YYYY-MM-DD');
			return new Date(d).getTime();
		};

		const _filters = {
			minDate: filterByDate ? minDate : null,
			maxDate: filterByDate ? maxDate : null,
            searchValue: searchValue || '', 
            ...filters
		};

		if (_filters?.minDate) {
			_sessions = _sessions.filter((s: any) => getParsedDate(s.data.started_at) >= getParsedDate(_filters.minDate));
		}

		if (_filters?.maxDate) {
			_sessions = _sessions.filter((s: any) => getParsedDate(s.data.started_at) <= getParsedDate(_filters.maxDate));
		}

        if (_filters?.searchValue) {
            _sessions = _sessions.filter((s: any) => `${s.uid || ''}`.toLowerCase().includes(_filters.searchValue.toLowerCase()));
        }

		return _sessions;
	};

	const getSessions = (opts: any = {}) => new Promise((resolve, reject) => {
		const { loader } = opts;

		(async () => {
			setLoadingSessions((loader === undefined) || loader);
			try {
				const location = await api.getLocation();
				const sessions: any = await api.getSessions();
				const dbSessions = (sessions || []).filter((s: any) => {
					return (
						(s.data?.country === location?.country) &&
						(s.data?.hospital_id === location?.hospital)
					);
				});
				setDBSessions(dbSessions);
				setSessions(getFilteredSessions(dbSessions));
				resolve(dbSessions);
			} catch (e: any) {
				Alert.alert(
					'Failed to load sessions',
					e.message || e.msg || JSON.stringify(e),
					[
						{
							text: 'Cancel',
							onPress: () => navigation.navigate('Home'),
						},
						{
							text: 'Try again',
							onPress: () => getSessions(),
						},
					]
				);
				
				reject(e);
			}
			setLoadingSessions(false);
		})();
	});
	
	React.useEffect(() => {
		if (isFocused) {
			getSessions();
			(async () => {
				try {
					const fields: any = await api.getScriptsFields();
					setScriptsFields(fields);

					const application = await api.getApplication();
					setApplication(application);

					const hasLocalServer = await api.hasLocalServerConfig();
					setLocalServerAvailable(hasLocalServer);
					setLocalServerChecked(true);
				} catch (e) { console.log(e); /* DO NOTHING */ }
			})();
		}
	}, [isFocused]);

	React.useEffect(() => {
		(async () => {
			try {
				const { granted } = await MediaLibrary.requestPermissionsAsync();
				if (!granted) {
					Alert.alert(
						'Permission denied',
						'Permission to write files to disk is not granted, you will not be able to export files.',
						[
							{
								text: 'Ok',
							}
						]
					);
				}
			} catch (e: any) {
				Alert.alert(
					'Error',
					e.message,
					[
						{
							text: 'Ok',
						}
					]
				);
				
				}
				setPageInitialised(true);
		})();
	}, []);

	const dateRange = (
		<>
			<DatePicker
				value={minDate}
				mode='date'
				label="Min Date"
				onChange={date => setMinDate(date)}
			/>

			<Br spacing="xl" />

			<DatePicker
				value={maxDate}
				mode='date'
				label="Max Date"
				onChange={date => setMaxDate(date)}
			/>
		</>
	);

	if (!pageInitialised) return null;

	if (selectedSession) {
		return (
			<Session 
				navigation={navigation} 
				session={selectedSession} 
				onBack={() => setSelectedSession(null)} 
			/>
		);
	}

	const runSearch = async (value: string) => {
		const trimmed = (value || '').trim();
		setLocalServerError('');
		if (!trimmed) {
			setSearchSource(null);
			setSessions(getFilteredSessions(dbSessions, { searchValue: trimmed }));
			return;
		}

		const localMatches = getFilteredSessions(dbSessions, { searchValue: trimmed });
		if (localMatches.length) {
			setSearchSource('local');
			setSessions(localMatches);
			return;
		}

		if (!localServerAvailable) {
			setSearchSource(null);
			setSessions([]);
			setLocalServerError('Local server not configured for this site.');
			return;
		}

		try {
			setSearchingLocalServer(true);
			const location = await api.getLocation();
			const hospital = location?.hospital;
			if (!hospital) throw new Error('Hospital not set');
			const remoteSessions: any = await api.getLocalSessionsByUID(trimmed, hospital, { partial: true });
			const remoteError = remoteSessions?.[0]?.error;
			if (remoteError) throw new Error(remoteError);
			const normalized = (remoteSessions || []).map((s: any) => ({ ...s, __source: 'localServer' }));
			setSearchSource('localServer');
			setSessions(normalized);
			if (!normalized.length) setLocalServerError('No results found on local server.');
		} catch (e: any) {
			setSearchSource(null);
			setSessions([]);
			setLocalServerError(e?.message || 'Local server unavailable.');
		} finally {
			setSearchingLocalServer(false);
		}
	};

	return (
		<>
            <Content>
                <TextInput
                    placeholder="Search Neotree ID"
                    value={searchValue}
                    onChangeText={searchValue => {
                        setSearchValue(searchValue);
                        if (searchTimeout.current) clearTimeout(searchTimeout.current);
                        searchTimeout.current = setTimeout(() => runSearch(searchValue), 1000);
                    }}
                />
				{!!searchingLocalServer && (
					<Box marginTop="s">
						<Text variant="caption" color="textSecondary">Searching local server…</Text>
					</Box>
				)}
				{!!localServerError && (
					<Box marginTop="s">
						<Text variant="caption" color="textSecondary">{localServerError}</Text>
					</Box>
				)}
				{searchSource === 'localServer' && (
					<Box marginTop="s">
						<Text variant="caption" color="textSecondary">Showing results from local server</Text>
					</Box>
				)}
            </Content>

			<FlatList
				data={sessions}
				onRefresh={getSessions}
				refreshing={loadingSessions}
				keyExtractor={(item: any, index) => `${item.id || item?.data?.unique_key || item?.unique_key || index}`}
				ListHeaderComponent={() => (
					<Content>
						{filterByDate && (
							<>
								{!!minDate && <Text color="textDisabled" variant="caption">Min date: {moment(minDate).format('LL')}</Text>}
								{!!maxDate && <Text color="textDisabled" variant="caption">Min date: {moment(maxDate).format('LL')}</Text>}
							</>
						)}
					</Content>
				)}
				ListEmptyComponent={() => (
					<Content>
						<Box style={{ paddingVertical: 25 }}>
							<Text style={{ textAlign: 'center', color: '#999' }}>
								{searchValue && localServerChecked && !localServerAvailable
									? 'Historic search unavailable: no local server configured.'
									: 'No sessions to display'}
							</Text>
						</Box>
					</Content>
				)}

				renderItem={({ item }) => {
					return (
						<>
							<Content>
								<TouchableOpacity
									onPress={async () => {
										setLoadingSessionDetails(true);
										const formatted = await normalizeSessionForDisplay(item);
										setSelectedSession(formatted);
										setLoadingSessionDetails(false);
									}}
									onLongPress={() => {
										if (!item?.id) return;
										Alert.alert(
											'Delete session',
											'Do you want to delete this session?',
											[
												{
													text: 'No',
													onPress: () => {},
												},
												{
													text: 'Yes',
													onPress: () => deleteSessions([item.id]),
												}
											]
										);
									}}
								>
									<Card>
										{!!item.exported && (
											<>
												<Box flexDirection="row">
													<Box 
														backgroundColor="success"
														paddingVertical="s"
														paddingHorizontal="m"
														borderRadius="xl"
													>
														<Text
															textAlign="center"
															variant="caption"
															color="successContrastText"
														>Exported Online</Text>
													</Box>
													
													{!!item.local_export && (	
														<Box 
															backgroundColor="highlight"
															paddingVertical="s"
															paddingHorizontal="xl"
															borderRadius="xl"
														>
															<Text
																textAlign="center"
																variant="caption"
																color="grey-900"
															>Exported Locally</Text>
														</Box>
													)}															
												</Box>
												<Br spacing="m" />
											</>
										)}

										{!(item?.data?.completed_at || item?.data?.canceled_at) && (
											<>
												<Box flexDirection="row">
													<Box 
														backgroundColor="error"
														paddingVertical="s"
														paddingHorizontal="m"
														borderRadius="xl"
													>
														<Text
															textAlign="center"
															variant="caption"
															color="successContrastText"
														>Interrupted</Text>
													</Box>	

													<View style={{ marginLeft: 'auto' }} />

													<Box>
														<TouchableOpacity
															onPress={() => navigation.navigate('Script', {
																script_id: item.script_id,
																session: item,
															})}
														>
															<Icon
																name="edit"
																size={24}
																color={theme.colors.textDisabled}
															/>
														</TouchableOpacity>
													</Box>											
												</Box>
												
												<Br spacing="m" />
											</>
										)}

										<Box flexDirection="row">
											<View style={{ flex: 1 }}>
												<Text color="textSecondary">Creation date</Text>
												<Text>
													{moment(new Date(item?.data?.started_at)).format('DD MMM, YYYY HH:mm')}
												</Text>
											</View>

											<View style={{ flex: 1 }}>
												<Text color="textSecondary">{`${item?.data?.canceled_at ? 'Cancellation' : 'Completion'}`} date</Text>
												<Text>
													{(item?.data?.canceled_at || item?.data?.completed_at) ?
														moment(new Date(item?.data?.canceled_at || item?.data?.completed_at)).format('DD MMM, YYYY HH:mm')
														:
														'N/A'}
												</Text>
											</View>
										</Box>

										<Br spacing="l" />

										<Box>
											<Text color="textSecondary">Script</Text>
											<Text>{item?.data?.script?.data?.title}</Text>
										</Box>
									</Card>
								</TouchableOpacity>
							</Content>
						</>
					)
				}}
			/>

			<Modal
				open={openFilterModal}
				onClose={() => setOpenFilterModal(false)}
				title="Filter sessions"
				actions={[
					{
						label: 'Cancel',
						onPress: () => {
							setMinDate(null);
							setMaxDate(null);
							setFilterByDate(false);
							setOpenFilterModal(false);
						}
					},
					{
						label: 'Filter',
						onPress: () => {
							if (minDate || maxDate) setFilterByDate(true);
							setOpenFilterModal(false);
							setSessions(getFilteredSessions(dbSessions));
						},
					}
				]}
			>
				{dateRange}
			</Modal>

			<Modal
				open={openDeleteModal}
				onClose={() => setOpenDeleteModal(false)}
				title="Delete sessions"
				actions={[
					{
						label: 'Cancel',
						onPress: () => {
							setDeleteType(deleteTypes[0].value);
							setOpenDeleteModal(false);
						}
					},
					{
						label: 'Delete',
						onPress: () => {							
							setOpenDeleteModal(false);
							switch (deleteType) {
								case 'all':
									const unexportedCompleteSessions = dbSessions.filter((s: any) => !s.exported && s?.data?.completed_at);
									const deletable = dbSessions.filter((s: any) => !unexportedCompleteSessions.find((s2: any) => s2.id === s.id))
									deleteSessions(deletable.map((s: any) => s.id));
									break;
								case 'incomplete':
									deleteSessions(dbSessions.filter((s: any) => !s?.data?.completed_at).map((s: any) => s.id));
									break;
								case 'date_range':
									deleteSessions(getFilteredSessions(dbSessions, { minDate, maxDate }).map((s: any) => s.id));
									break;
								default:
									// do nothing
							}
						},
					}
				]}
			>
				{deleteTypes.map(t => (
					<React.Fragment key={t.value}>
						<Radio 							
							label={t.label}
							value={t.value}
							checked={t.value === deleteType}
							onChange={t => setDeleteType(t as string)}
						/>
						<Br spacing="m" />
					</React.Fragment>
				))}
				{deleteType === 'date_range' && (
					<>
						<Br spacing='s'/>
						{dateRange}
					</>
				)}
			</Modal>

			<Modal
				open={openExportModal}
				onClose={() => setOpenExportModal(false)}
				title="Export sessions"
				actions={[
					{
						label: 'Cancel',
						onPress: () => {
							setExportType(exportTypes[0].value);
							setShowExportFormats(false);
							setOpenExportModal(false);
						}
					},
					{
						label: showExportFormats ? 'Export' : 'Next',
						onPress: () => {
							if (showExportFormats) {
								exportSessions();
								setOpenExportModal(false);
							} else {
								setShowExportFormats(true);
							}
						},
					}
				]}
			>
				{showExportFormats ? 
					exportFormats.map(t => (
						<React.Fragment key={t.value}>
							<Radio 							
								label={t.label}
								value={t.value}
								checked={t.value === exportFormat}
								onChange={t => setExportFormat(t as string)}
							/>
							<Br spacing="m" />
						</React.Fragment>
					))
					:
					exportTypes.map(t => (
						<React.Fragment key={t.value}>
							<Radio 							
								label={t.label}
								value={t.value}
								checked={t.value === exportType}
								onChange={t => setExportType(t as string)}
							/>
							<Br spacing="m" />
						</React.Fragment>
					))}
				{exportType === 'date_range' && (
					<>
						<Br spacing='s'/>
						{dateRange}
					</>
				)}
			</Modal>

			{(deletingSessions || exportingSessions || loadingSessionDetails) && <OverlayLoader />}
		</>
	);
}
