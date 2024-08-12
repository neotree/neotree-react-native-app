import React from 'react';
import { useIsFocused } from '@react-navigation/native';
import { Alert, Platform, TouchableOpacity, FlatList, View } from "react-native";
import * as MediaLibrary from 'expo-media-library';
import Icon from '@expo/vector-icons/MaterialIcons';
import moment from 'moment';
import * as types from '../../types';
import * as api from '../../data';
import { Box, Text, Modal, DatePicker, Br, Radio, Content, Card, OverlayLoader, useTheme } from '../../components';
import exportData from './export';
import { Session } from './Session';

const exportTypes = [
	{
		label: 'All sessions',
		value: 'all',
	},
	{
		label: 'Completed sessions',
		value: 'completed',
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
	{ label: 'JSON', value: 'json' },
	{ label: 'JSONAPI', value: 'jsonapi' },
];

const deleteTypes = exportTypes.filter((_, i) => i !== 1);

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

	const exportSessions = async (opts: any = {}) => {
		let sessions = dbSessions;
		switch (exportType) {
			case 'completed':
				sessions = dbSessions.filter((s: any) => s.data.completed_at);
				break;
			case 'incomplete':
				sessions = dbSessions.filter((s: any) => !s.data.completed_at);
				break;
			case 'date_range':
				sessions = getFilteredSessions(dbSessions, { minDate, maxDate }).map((s: any) => s.id) as any;
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

		const _filters = filters || {
			minDate: filterByDate ? minDate : null,
			maxDate: filterByDate ? maxDate : null,
		};

		if (_filters?.minDate) {
			_sessions = sessions.filter((s: any) => getParsedDate(s.data.started_at) >= getParsedDate(_filters.minDate));
		}

		if (_filters?.maxDate) {
			_sessions = sessions.filter((s: any) => getParsedDate(s.data.started_at) <= getParsedDate(_filters.maxDate));
		}

		return _sessions;
	};

	const getSessions = (opts: any = {}) => new Promise((resolve, reject) => {
		const { loader } = opts;

		(async () => {
			setLoadingSessions((loader === undefined) || loader);
			try {
				const sessions: any = await api.getSessions();
				setDBSessions(sessions || []);
				setSessions(getFilteredSessions(sessions || []));
				resolve(sessions || []);
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

	return (
		<>
			<FlatList
				data={sessions}
				onRefresh={getSessions}
				refreshing={loadingSessions}
				keyExtractor={(item: any) => `${item.id}`}
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
							<Text style={{ textAlign: 'center', color: '#999' }}>No sessions to display</Text>
						</Box>
					</Content>
				)}

				renderItem={({ item }) => {
					return (
						<>
							<Content>
								<TouchableOpacity
									onPress={() => setSelectedSession(item)}
									onLongPress={() => {
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
														>Exported</Text>
													</Box>												
												</Box>
												<Br spacing="m" />
											</>
										)}

										{!(item.data.completed_at || item.data.canceled_at) && (
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
													{moment(new Date(item.data.started_at)).format('DD MMM, YYYY HH:mm')}
												</Text>
											</View>

											<View style={{ flex: 1 }}>
												<Text color="textSecondary">{`${item.data.canceled_at ? 'Cancellation' : 'Completion'}`} date</Text>
												<Text>
													{(item.data.canceled_at || item.data.completed_at) ?
														moment(new Date(item.data.canceled_at || item.data.completed_at)).format('DD MMM, YYYY HH:mm')
														:
														'N/A'}
												</Text>
											</View>
										</Box>

										<Br spacing="l" />

										<Box>
											<Text color="textSecondary">Script</Text>
											<Text>{item.data.script.data.title}</Text>
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
							setDeleteType('all');
							setOpenDeleteModal(false);
						}
					},
					{
						label: 'Delete',
						onPress: () => {							
							setOpenDeleteModal(false);
							switch (deleteType) {
								case 'all':
									deleteSessions(dbSessions.map((s: any) => s.id));
									break;
								case 'incomplete':
									deleteSessions(dbSessions.filter((s: any) => !s.data.completed_at).map((s: any) => s.id));
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
						<Br />
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
							setExportType('all');
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
						<Br />
						{dateRange}
					</>
				)}
			</Modal>

			{(deletingSessions || exportingSessions) && <OverlayLoader />}
		</>
	);
}
