import React from 'react';
import { useIsFocused } from '@react-navigation/native';
import { ActivityIndicator, Alert, Platform, TouchableOpacity, FlatList, View } from "react-native";
import Icon from '@expo/vector-icons/MaterialIcons';
import moment from 'moment';
import * as types from '../../types';
import * as api from '../../data';
import { Box, Text, Modal, DatePicker, Br, Radio, Content, Card, OverlayLoader, useTheme, TextInput } from '@/src/components';
import exportData from './export';
import { Session } from './Session';
import { dateRangeError, filterSessionsByDateRange, SessionDateField } from '../../utils/sessionDateRange';
import { formatNeotreeIDInput, NEOTREE_ID_MAX_LENGTH } from '../../utils/neotreeId';
import { getSessionScriptTitle, getSessionUID } from '../../utils/sessionFields';
import { logError } from '@/src/utils/logError';

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
		label: 'All (except sessions still awaiting export)',
		value: 'all',
	},
	{
		label: 'Incomplete (unsubmitted) sessions',
		value: 'incomplete',
	},
	{
		label: 'Date range',
		value: 'date_range',
	},
];

// Rows per page in the history list. Large enough that a page fills the screen
// on a tablet, small enough that opening the screen is never a full-table read.
const SESSIONS_PAGE_SIZE = 20;

const exportFormats = [
	{ label: 'Excel Spreadsheet', value: 'excel' },
	{ label: 'JSON (Save to Tablet)', value: 'json' },
	{ label: 'JSONAPI (Send to Database)', value: 'jsonapi' },
];

export function Sessions({ navigation }: types.StackNavigationProps<types.HomeRoutes, 'Sessions'>) {
	const theme = useTheme();

	const isFocused = useIsFocused();

	const [application, setApplication] = React.useState<null | types.Application>(null);

	const [openExportModal, setOpenExportModal] = React.useState(false);
	const [openFilterModal, setOpenFilterModal] = React.useState(false);
	const [openDeleteModal, setOpenDeleteModal] = React.useState(false);

	const [filterMinDate, setFilterMinDate] = React.useState<null | Date>(null);
	const [filterMaxDate, setFilterMaxDate] = React.useState<null | Date>(null);
	const [exportMinDate, setExportMinDate] = React.useState<null | Date>(null);
	const [exportMaxDate, setExportMaxDate] = React.useState<null | Date>(null);
	const [deleteMinDate, setDeleteMinDate] = React.useState<null | Date>(null);
	const [deleteMaxDate, setDeleteMaxDate] = React.useState<null | Date>(null);
	const [filterByDate, setFilterByDate] = React.useState(false);

	const [deleteType, setDeleteType] = React.useState(deleteTypes[0].value);
	const [deletingSessions, setDeletingSessions] = React.useState(false);

	const [exportType, setExportType] = React.useState(exportTypes[0].value);
	const [exportFormat, setExportFormat] = React.useState(exportFormats[0].value);
	const [showExportFormats, setShowExportFormats] = React.useState(false);
	// Sending to the database can also leave a copy on the tablet. Off unless
	// asked for: it means choosing a folder, which a send should not require.
	const [saveCopyOnApiExport, setSaveCopyOnApiExport] = React.useState(false);
	const [exportingSessions, setExportingSessions] = React.useState(false);
	const [exportProgress, setExportProgress] = React.useState<null | { done: number; total: number }>(null);
	const [backgroundExportRunning, setBackgroundExportRunning] = React.useState(false);
	const [pendingExportCount, setPendingExportCount] = React.useState(0);
	const [quarantine, setQuarantine] = React.useState<api.QuarantineSummary>({ count: 0, lastError: null });

	const [sessions, setSessions] = React.useState<any[]>([]);
	const [loadingSessions, setLoadingSessions] = React.useState(false);
	const [loadingMoreSessions, setLoadingMoreSessions] = React.useState(false);
	// 'browse' pages straight out of the db; the other modes hold a result set
	// that is already complete, so there is nothing further to page in.
	const [listMode, setListMode] = React.useState<'browse' | 'filtered' | 'search' | 'localServer'>('browse');
	const [hasMoreSessions, setHasMoreSessions] = React.useState(false);
	const [totalSessions, setTotalSessions] = React.useState(0);
	// Where the next page starts: the last row shown (see sessionsPageQuery).
	const nextPageCursor = React.useRef<api.SessionsCursor | null>(null);
	// Guards paged reads the same way searchRequestId guards searches: a slow
	// page must not append itself after a refresh or a filter has moved on.
	const listRequestId = React.useRef(0);
	const [scriptsFields, setScriptsFields] = React.useState({});

	const [selectedSession, setSelectedSession] = React.useState<any>(null);

    const [searchValue, setSearchValue] = React.useState('');
    const [lastSearchedValue, setLastSearchedValue] = React.useState('');
    const searchTimeout = React.useRef<any>();
    // Incremented per search so replies for superseded searches are ignored.
    const searchRequestId = React.useRef(0);
	const [localServerAvailable, setLocalServerAvailable] = React.useState(false);
	const [localServerChecked, setLocalServerChecked] = React.useState(false);
	const [searchingLocalServer, setSearchingLocalServer] = React.useState(false);
	const [localServerError, setLocalServerError] = React.useState('');
	const [searchSource, setSearchSource] = React.useState<null | 'local' | 'localServer'>(null);
	const [loadingSessionDetails, setLoadingSessionDetails] = React.useState(false);
	const [location, setLocation] = React.useState<null | types.Location>(null);
	const [hasLocalConfig, setHasLocalConfig] = React.useState(false);


	const isDeliveredSession = React.useCallback(
		(s: any) => api.isFullyDelivered(s, location, hasLocalConfig),
		[location, hasLocalConfig]
	);

	// The "Exported Online"/"Exported Locally" badges only reflect two of the
	// three destinations a session may owe data to - the confidential/poll
	// data delivery (`poll_exported`) has no badge of its own. A session can
	// look fully exported and still be blocked from deletion because of it, so
	// spell out exactly what's still pending rather than a generic message.
	const getPendingDestinations = React.useCallback((s: any): string[] => {
		if (!api.isExportableSession(s)) return [];
		const pending: string[] = [];
		if (!s.exported) pending.push('server');
		// isPollDelivered, not the raw flag: it also treats sessions that
		// predate poll tracking as delivered, exactly as the deletion rule does.
		if (!api.isPollDelivered(s)) pending.push('confidential data sync');
		if (api.localRequiredForSession(s, location, hasLocalConfig) && !s.local_export) pending.push('local server');
		return pending;
	}, [location, hasLocalConfig]);

	const isDraftSession = React.useCallback((s: any) => !api.isTerminalSession(s), []);

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

	/** Turns an API export's outcome into what the user is told. */
	const describeApiExport = (result: any): { title: string; message: string } => {
		switch (result?.status) {
			case 'already-exported':
				return {
					title: 'Already exported',
					message: result.alreadyExported === 1
						? 'This session has already been exported. Nothing was sent again.'
						: `All ${result.alreadyExported} selected sessions have already been exported.`,
				};
			case 'local-only':
				return {
					title: 'Saved to local server',
					message: (result.localOk
						? `${result.localOk} session(s) saved to the local server. `
						: `These sessions are already saved on the local server. `)
						+ (result.failures?.some((failure: api.ExportFailure) => failure.kind === 'network')
							? `The cloud server can't be reached right now. The app will retry automatically.`
							: `Cloud delivery needs attention: ${result.failures?.[0]?.message || 'delivery is still pending'}.`),
				};
			case 'partial':
				return {
					title: 'Partially exported',
					message: `Sent to the cloud: ${result.remoteOk}. `
						+ (result.localConfigured ? `Saved locally: ${result.localOk}. ` : '')
						+ (result.alreadyExported ? `Already exported previously: ${result.alreadyExported}. ` : '')
						+ `Still queued: ${Math.max(result.remotePending, result.localPending)} session(s) — these retry automatically.`,
				};
			default:
				return {
					title: '',
					message: result?.localConfigured
						? 'Export success — sent to both the cloud and the local server.'
						: 'Export success',
				};
		}
	};

	const validateExportDateRange = () => {
		if (exportType !== 'date_range') return true;
		if (!exportMinDate && !exportMaxDate) {
			Alert.alert('Date range required', 'Select a start date, an end date, or both.');
			return false;
		}
		const error = dateRangeError(exportMinDate, exportMaxDate);
		if (error) {
			Alert.alert('Invalid date range', error);
			return false;
		}
		return true;
	};

	const exportSessions = async (opts: any = {}) => {
		setExportingSessions(true);

		// The rendered list is paged, so the set to export is read fresh: an
		// "all completed sessions" export must not mean "the pages scrolled".
		let allSessions: any[] = [];
		try {
			allSessions = await loadAllSessionsForLocation();
		} catch (e: any) {
			setExportingSessions(false);
			Alert.alert(
				'Failed to read sessions',
				e.message || e.msg || JSON.stringify(e),
				[
					{ text: 'Try again', onPress: () => exportSessions(opts) },
					{ text: 'Cancel' },
				]
			);
			return;
		}

		const _dbSessions = allSessions.filter(api.isExportableSession);
		let sessions = _dbSessions;
		switch (exportType) {
			case 'date_range': {
				if (!validateExportDateRange()) {
					setExportingSessions(false);
					return;
				}
				sessions = getFilteredSessions(_dbSessions, {
					minDate: exportMinDate,
					maxDate: exportMaxDate,
					dateField: 'completed',
					searchValue: '',
				});
				if (!sessions.length) {
					setExportingSessions(false);
					Alert.alert('Nothing to export', 'No completed sessions fall within the selected completion-date range.');
					return;
				}
				break;
			}
			default:
				// do nothing
		}
		try {
			const result: any = await exportData({
				...opts,
				format: exportFormat,
				sessions,
				scriptsFields,
				application,
				saveCopy: opts.saveCopy ?? saveCopyOnApiExport,
				onProgress: (done: number, total: number) => setExportProgress({ done, total }),
			});
			if (exportFormat === 'jsonapi') await refreshSessions();

			let title = '';
			let message = 'Export success';
			if (exportFormat === 'jsonapi') {
				({ title, message } = describeApiExport(result));
			} else if (result?.cancelled) {
				// The folder picker was dismissed, so nothing was written. This
				// used to report success.
				title = 'Export cancelled';
				message = 'No folder was selected, so no file was saved.';
			} else {
				message = `Export success — ${result?.written ?? sessions.length} session(s) saved.`;
				if (result?.skipped) {
					message += ` ${result.skipped} session(s) could not be prepared and were left out;`
						+ ` they remain on this device and are reported in the error log.`;
				}
			}

			Alert.alert(
				title,
				message,
				[
					{
						text: 'Ok',
					}
				]
			);
		} catch (e: any) {
			if (exportFormat === 'excel') {
				logError('Sessions.excelExport', e, {
					exportType,
					sessionCount: Array.isArray(sessions) ? sessions.length : 0,
				});
			}
			Alert.alert(
				'Failed to export data',
				e.message || e.msg || JSON.stringify(e),
				[
					{
						text: 'Try again',
						onPress: () => exportSessions({ saveCopy: false })
					},
					{
						text: 'Cancel',
					}
				]
			);
			
		}
		setExportingSessions(false);
		setExportProgress(null);
		setShowExportFormats(false);
		refreshPendingExportCount();
	};

	// Summarizes *why* a set of blocked sessions can't be deleted yet, broken
	// down by destination, so "exported but still blocked" is never a mystery
	// (the export/local badges don't show confidential-data-sync status).
	const summarizePending = React.useCallback((list: any[]): string => {
		const counts: Record<string, number> = {};
		list.forEach((s: any) => {
			getPendingDestinations(s).forEach((dest) => { counts[dest] = (counts[dest] || 0) + 1; });
		});
		const parts = Object.entries(counts).map(([dest, count]) => `${count} awaiting ${dest}`);
		return parts.length ? ` (${parts.join(', ')})` : '';
	}, [getPendingDestinations]);

	const deleteSessions = async (ids: any[] = [], opts: { allowDrafts?: boolean } = {}) => {
		if (!ids.length) {
			Alert.alert('Nothing to delete', 'No sessions matched this selection.', [{ text: 'Ok' }]);
			return;
		}

		const allRows: any[] = await api.getSessionsByIds(ids);
		const byId: any = {};
		allRows.forEach((s: any) => { if (s?.id !== undefined) byId[s.id] = s; });

		const requested = ids.map((id: any) => byId[id]).filter(Boolean);
		const deletable = requested.filter((s: any) => (
			isDeliveredSession(s) || (opts.allowDrafts && isDraftSession(s))
		));
		const blocked = requested.filter((s: any) => !deletable.includes(s));

		if (!deletable.length) {
			const blockedWithError = blocked.find((session: any) => (
				session.main_export_blocked || session.poll_export_blocked || session.local_export_blocked
			));
			Alert.alert(
				'Nothing deleted',
				blockedWithError
					? `This session has an export error and was kept to protect its data. ${blockedWithError.export_last_error || 'Retry the export after checking the server configuration.'}`
					: (blocked.length === 1
						? 'This session has not finished exporting yet, so it cannot be deleted.'
						: `${blocked.length} session(s) have not finished exporting yet, so none were deleted.`)
						+ summarizePending(blocked)
						+ ' They will be sent automatically once a server is reachable.',
				[{ text: 'Ok' }]
			);
			return;
		}

		const proceed = async () => {
			setDeletingSessions(true);
			try {
				await api.deleteSessions(deletable.map((s: any) => s.id));
				await refreshSessions();
			} catch (e: any) {
				Alert.alert(
				'ERROR',
				e.message || e.msg || JSON.stringify(e),
				[
					{
						text: 'Try again',
						onPress: () => deleteSessions(ids, opts),
					},
					{
						text: 'Cancel',
						onPress: () => {},
					}
				]
				);

			}
			setDeletingSessions(false);
		};

		if (blocked.length) {
			Alert.alert(
				'Some sessions kept',
				`${blocked.length} session(s) have not finished exporting${summarizePending(blocked)} and will be kept. `
				+ `Delete the remaining ${deletable.length} session(s)?`,
				[
					{ text: 'Cancel', style: 'cancel' },
					{ text: 'Delete', onPress: () => { proceed(); } },
				]
			);
			return;
		}

		await proceed();
	};

	/**
	 * Opens the export options, unless an export is already running.
	 *
	 * Sending the same sessions twice is already impossible - runs are
	 * serialized and each one re-reads the delivery flags - but a second export
	 * started on top of a sweep looks stuck and invites repeated taps, so say
	 * what is happening and let it finish.
	 */
	const openExport = React.useCallback(async () => {
		if (!api.isExportRunning()) {
			setOpenExportModal(true);
			return;
		}

		let pending = 0;
		try { pending = await api.countPendingExports(); } catch { /* the count is optional */ }
		if (pending) setPendingExportCount(pending);

		Alert.alert(
			'Export already running',
			(pending
				? `${pending} session${pending === 1 ? ' is' : 's are'} being sent in the background right now. `
				: 'An export is running in the background right now. ')
			+ 'These sessions are already queued, so there is nothing to start again - leave it running and come back in a few minutes.',
			[
				{ text: 'Continue in background', style: 'cancel' },
				{ text: 'Open export options', onPress: () => setOpenExportModal(true) },
			]
		);
	}, []);

	/**
	 * Resolves what the delete modal selected into ids.
	 *
	 * Reads the whole history rather than the rendered page: "all" has to mean
	 * all, whether or not the user has scrolled.
	 */
	const confirmDeleteSelection = async () => {
		if (deleteType === 'date_range') {
			if (!deleteMinDate && !deleteMaxDate) {
				Alert.alert('Date range required', 'Select a start date, an end date, or both.');
				return;
			}
			const error = dateRangeError(deleteMinDate, deleteMaxDate);
			if (error) {
				Alert.alert('Invalid date range', error);
				return;
			}
		}
		setOpenDeleteModal(false);

		let allSessions: any[] = [];
		setDeletingSessions(true);
		try {
			allSessions = await loadAllSessionsForLocation();
		} catch (e: any) {
			setDeletingSessions(false);
			Alert.alert('Failed to read sessions', e.message || e.msg || JSON.stringify(e), [{ text: 'Ok' }]);
			return;
		}
		setDeletingSessions(false);

		switch (deleteType) {
			case 'all':
				// Not pre-filtered to deletable sessions: everything goes through
				// deleteSessions so anything still awaiting delivery is reported
				// and explained, rather than silently skipped.
				await deleteSessions(allSessions.map((s: any) => s.id), { allowDrafts: true });
				break;
			case 'incomplete':
				await deleteSessions(
					allSessions.filter(isDraftSession).map((s: any) => s.id),
					{ allowDrafts: true }
				);
				break;
			case 'date_range': {
				const rangeSessions = getFilteredSessions(allSessions, {
					minDate: deleteMinDate,
					maxDate: deleteMaxDate,
					dateField: 'started',
					searchValue: '',
				});
				if (!rangeSessions.length) {
					Alert.alert('Nothing to delete', 'No sessions were created within the selected date range.');
				} else {
					await deleteSessions(rangeSessions.map((s: any) => s.id), { allowDrafts: true });
				}
				setDeleteMinDate(null);
				setDeleteMaxDate(null);
				break;
			}
			default:
				// do nothing
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
						<TouchableOpacity onPress={() => { openExport(); }}>
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
	}, [navigation, selectedSession, openExport]);

	const getFilteredSessions = (
		sessions: any[],
		filters?: {
			minDate?: Date | null;
			maxDate?: Date | null;
			searchValue?: string;
			dateField?: SessionDateField;
		}
	) => {
		const resolvedFilters = {
			minDate: filterByDate ? filterMinDate : null,
			maxDate: filterByDate ? filterMaxDate : null,
			searchValue: searchValue || '',
			dateField: 'started' as SessionDateField,
			...filters,
		};

		let filtered = filterSessionsByDateRange(sessions, resolvedFilters);
		if (resolvedFilters.searchValue) {
			const query = resolvedFilters.searchValue.toLowerCase();
			filtered = filtered.filter((session: any) => `${getSessionUID(session)}`.toLowerCase().includes(query));
		}
		return filtered;
	};

	/**
	 * Every session for this site, read at the moment it is needed.
	 *
	 * Bulk export and delete act on the whole history, not on whatever has been
	 * scrolled into view, so they must not read the rendered page.
	 */
	const loadAllSessionsForLocation = async (): Promise<any[]> => {
		const loc = location || await api.getLocation();
		if (!loc?.country || !loc?.hospital) return [];
		return api.getSessionsForLocation(loc.country, loc.hospital);
	};

	const loadFirstPage = (opts: any = {}) => new Promise<any[]>((resolve, reject) => {
		const { loader } = opts;

		(async () => {
			setLoadingSessions((loader === undefined) || loader);
			const requestId = ++listRequestId.current;
			try {
				const location = await api.getLocation();
				setLocation(location);
				setHasLocalConfig(await api.hasLocalServerConfig());

				if (!(location?.country && location?.hospital)) {
					if (listRequestId.current === requestId) {
						setSessions([]);
						setTotalSessions(0);
						setHasMoreSessions(false);
						nextPageCursor.current = null;
						setListMode('browse');
					}
					resolve([]);
					return;
				}

				const page = await api.getSessionsPageForLocation(location.country, location.hospital, {
					limit: SESSIONS_PAGE_SIZE,
				});
				if (listRequestId.current !== requestId) {
					resolve([]);
					return;
				}

				nextPageCursor.current = page.cursor;
				setSessions(page.rows);
				setHasMoreSessions(page.hasMore);
				setListMode('browse');
				resolve(page.rows);

				// The total is only a caption, so it must never hold up the list.
				api.countSessionsForLocation(location.country, location.hospital)
					.then(total => { if (listRequestId.current === requestId) setTotalSessions(total); })
					.catch(() => {});
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
							onPress: () => loadFirstPage(),
						},
					]
				);

				reject(e);
			}
			if (listRequestId.current === requestId) setLoadingSessions(false);
		})();
	});

	/** Appends the next page. Only 'browse' is paged; see `listMode`. */
	const loadMoreSessions = async () => {
		if (listMode !== 'browse') return;
		if (!hasMoreSessions || loadingMoreSessions || loadingSessions) return;
		if (!location?.country || !location?.hospital) return;

		const requestId = listRequestId.current;
		setLoadingMoreSessions(true);
		try {
			const page = await api.getSessionsPageForLocation(location.country, location.hospital, {
				limit: SESSIONS_PAGE_SIZE,
				cursor: nextPageCursor.current,
			});
			// A refresh, filter or search while this page was in flight wins.
			if (listRequestId.current !== requestId) return;

			nextPageCursor.current = page.cursor;
			setSessions(current => {
				const seen = new Set(current.map((s: any) => s.id));
				return [...current, ...page.rows.filter((s: any) => !seen.has(s.id))];
			});
			setHasMoreSessions(page.hasMore);
		} catch (e: any) {
			if (listRequestId.current === requestId) {
				// Silent: the rows already shown stay usable, and pulling again
				// or scrolling retries. An alert here would fire mid-scroll.
				logError('Sessions.loadMore', e);
				setHasMoreSessions(false);
			}
		} finally {
			if (listRequestId.current === requestId) setLoadingMoreSessions(false);
		}
	};

	/**
	 * Applies the date filter. Date matching runs in JS, so the whole history is
	 * read once here and the result set is complete - hence no paging in this
	 * mode.
	 */
	const applyDateFilter = async (minDate: Date | null, maxDate: Date | null) => {
		const requestId = ++listRequestId.current;
		setLoadingSessions(true);
		try {
			const all = await loadAllSessionsForLocation();
			if (listRequestId.current !== requestId) return;
			const filtered = getFilteredSessions(all, { minDate, maxDate, dateField: 'started' });
			setSessions(filtered);
			setTotalSessions(all.length);
			setHasMoreSessions(false);
			setListMode('filtered');
		} catch (e: any) {
			if (listRequestId.current !== requestId) return;
			Alert.alert('Failed to filter sessions', e.message || e.msg || JSON.stringify(e), [{ text: 'Ok' }]);
		} finally {
			if (listRequestId.current === requestId) setLoadingSessions(false);
		}
	};

	const runSearch = async (value: string) => {
		// A half-typed id ends in the separator the field inserts for the user;
		// searching for it would never match.
		const trimmed = (value || '').trim().replace(/-+$/, '');

		// Only the newest search may write results. Without this, a slow reply
		// for an earlier keystroke can land after a later one and wipe out the
		// results the user is looking at - which reads as "not found" until
		// they retype a character and search again.
		const requestId = ++searchRequestId.current;
		const isCurrentSearch = () => searchRequestId.current === requestId;
		// A page fetched before this search must not append itself to results.
		listRequestId.current += 1;

		if (searchTimeout.current) {
			clearTimeout(searchTimeout.current);
			searchTimeout.current = null;
		}

		setLocalServerError('');
		setLastSearchedValue(trimmed);

		if (!trimmed) {
			setSearchingLocalServer(false);
			setSearchSource(null);
			if (filterByDate) await applyDateFilter(filterMinDate, filterMaxDate);
			else await loadFirstPage({ loader: false });
			return;
		}

		const loc = location || await api.getLocation();
		if (!isCurrentSearch()) return;

		// Searched in the db rather than over the loaded page, so a paged list
		// still finds sessions that have not been scrolled to.
		const matches = await api.searchSessionsByUIDForLocation(
			loc?.country as string,
			loc?.hospital as string,
			trimmed,
		);
		if (!isCurrentSearch()) return;

		const localMatches = getFilteredSessions(matches, { searchValue: '' });
		if (localMatches.length) {
			setSearchingLocalServer(false);
			setSearchSource('local');
			setSessions(localMatches);
			setHasMoreSessions(false);
			setListMode('search');
			return;
		}

		try {
			setSearchingLocalServer(true);

			// Read the configuration now rather than trusting the cached flag:
			// it is populated by an async effect, so a search typed while the
			// screen is still settling would report "not configured" for a site
			// that does have a local server.
			const location = await api.getLocation();
			const hospital = location?.hospital;
			const configured = await api.hasLocalServerConfig();
			if (!isCurrentSearch()) return;

			setLocalServerAvailable(configured);
			setLocalServerChecked(true);

			if (!hospital) {
				setSearchSource(null);
				setSessions([]);
				setLocalServerError('This device has no hospital set, so historic records cannot be searched.');
				return;
			}
			if (!configured) {
				setSearchSource(null);
				setSessions([]);
				setLocalServerError('Local server not configured for this site.');
				return;
			}

			// An explicit search is a user-initiated attempt, so it gets a fresh
			// connection: a breaker tripped by background exports must not make
			// the search fail without the server ever being contacted.
			api.resetCircuit(api.backendKey(location?.country, 'local', hospital));

			const remoteSessions: any = await api.getLocalSessionsByUID(trimmed, hospital, { partial: true });
			if (!isCurrentSearch()) return;

			const remoteError = remoteSessions?.[0]?.error;
			if (remoteError) throw new Error(remoteError);

			const normalized = (remoteSessions || []).map((s: any) => ({ ...s, __source: 'localServer' }));
			setSearchSource('localServer');
			setSessions(normalized);
			setHasMoreSessions(false);
			setListMode('localServer');
			if (!normalized.length) setLocalServerError(`No record for ${trimmed} on the local server.`);
		} catch (e: any) {
			if (!isCurrentSearch()) return;
			setSearchSource(null);
			setSessions([]);
			setLocalServerError(e?.message || 'Local server unavailable.');
		} finally {
			if (isCurrentSearch()) setSearchingLocalServer(false);
		}
	};

	/** Re-runs whichever view is active, after a refresh or a change. */
	const refreshSessions = async (opts: any = {}) => {
		if (searchValue.trim()) return runSearch(searchValue);
		if (filterByDate) return applyDateFilter(filterMinDate, filterMaxDate);
		return loadFirstPage(opts);
	};

	React.useEffect(() => {
		if (isFocused) {
			refreshSessions();
			(async () => {
				try {
					const fields: any = await api.getScriptsFields();
					setScriptsFields(fields);

					const application = await api.getApplication();
					setApplication(application);

					const hasLocalServer = await api.hasLocalServerConfig();
					setLocalServerAvailable(hasLocalServer);
					setLocalServerChecked(true);
				} catch { /* DO NOTHING */ }
			})();
		}
	// refreshSessions intentionally reads the current render state.
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isFocused]);

	React.useEffect(() => () => {
		if (searchTimeout.current) clearTimeout(searchTimeout.current);
	}, []);

	const refreshPendingExportCount = React.useCallback(async () => {
		try {
			const [pending, quarantined] = await Promise.all([
				api.countPendingExports(),
				api.getQuarantineSummary(),
			]);
			setPendingExportCount(pending);
			setQuarantine(quarantined);
		} catch { /* status lines are optional */ }
	}, []);

	/**
	 * Gives every quarantined session a fresh attempt now, rather than waiting
	 * for the sweep to release it. Quarantined sessions can come from any site
	 * on this device, so this does not go through the site-scoped export.
	 */
	const retryQuarantinedExports = async () => {
		if (api.isExportRunning()) {
			openExport();
			return;
		}

		setExportingSessions(true);
		try {
			const quarantined = await api.getQuarantinedSessions();
			if (!quarantined.length) {
				Alert.alert('Nothing to retry', 'No sessions are waiting on an export problem any more.', [{ text: 'Ok' }]);
				return;
			}
			const result: any = await exportData({
				format: 'jsonapi',
				sessions: quarantined,
				scriptsFields,
				application,
				saveCopy: false,
				onProgress: (done: number, total: number) => setExportProgress({ done, total }),
			});
			await refreshSessions();
			const { title, message } = describeApiExport(result);
			Alert.alert(title || 'Retry finished', message, [{ text: 'Ok' }]);
		} catch (e: any) {
			Alert.alert(
				'Retry did not finish',
				`${e?.message || 'The export failed.'} The sessions remain on this device and will be retried automatically.`,
				[{ text: 'Ok' }]
			);
		} finally {
			setExportingSessions(false);
			setExportProgress(null);
			refreshPendingExportCount();
		}
	};

	// The background sweep runs whether or not this screen is open, so the
	// screen follows it rather than assuming exports only happen here.
	React.useEffect(() => {
		setBackgroundExportRunning(api.isExportRunning());
		refreshPendingExportCount();

		return api.onExportRunningChange(running => {
			setBackgroundExportRunning(running);
			// The list is deliberately not reloaded here: that would reset the
			// scroll position under the user. The caption clearing is the cue.
			refreshPendingExportCount();
		});
	}, [refreshPendingExportCount]);

	const renderDateRange = (
		minDate: Date | null,
		maxDate: Date | null,
		setMinDate: (date: Date | null) => void,
		setMaxDate: (date: Date | null) => void,
	) => (
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
            <Content>
                <TextInput
                    placeholder="Search Neotree ID"
                    value={searchValue}
                    autoCapitalize="characters"
                    // The shared default is the visible-password keyboard, which
                    // ignores autoCapitalize on Android, so this field asks for
                    // the standard keyboard to get a caps-locked keypad.
                    keyboardType="default"
                    maxLength={NEOTREE_ID_MAX_LENGTH}
                    returnKeyType="search"
                    // Searching on submit means a retry never requires editing
                    // the id, and it skips the debounce for a complete one.
                    onSubmitEditing={() => runSearch(searchValue)}
                    onChangeText={raw => {
                        const formatted = formatNeotreeIDInput(raw, searchValue);
                        setSearchValue(formatted);
                        if (searchTimeout.current) clearTimeout(searchTimeout.current);
                        searchTimeout.current = setTimeout(() => runSearch(formatted), 1000);
                    }}
                />
				{!!searchingLocalServer && (
					<Box marginTop="s">
						<Text variant="caption" color="textSecondary">Searching local server for {lastSearchedValue}…</Text>
					</Box>
				)}
				{!!localServerError && !searchingLocalServer && (
					<Box marginTop="s" flexDirection="row" alignItems="center">
						<Box flex={1}>
							<Text variant="caption" color="textSecondary">{localServerError}</Text>
						</Box>

						<TouchableOpacity onPress={() => runSearch(searchValue)}>
							<Box paddingVertical="s" paddingLeft="m">
								<Text variant="caption" color="primary">Try again</Text>
							</Box>
						</TouchableOpacity>
					</Box>
				)}
				{quarantine.count > 0 && !backgroundExportRunning && (
					<Box
						marginTop="s"
						padding="m"
						borderRadius="m"
						borderWidth={1}
						borderColor="error"
						flexDirection="row"
						alignItems="center"
					>
						<Box flex={1}>
							<Text variant="caption" color="error">
								{quarantine.count === 1
									? '1 session on this device could not be exported.'
									: `${quarantine.count} sessions on this device could not be exported.`}
							</Text>
							{!!quarantine.lastError && (
								<Text variant="caption" color="textSecondary" numberOfLines={2}>
									{quarantine.lastError}
								</Text>
							)}
							<Text variant="caption" color="textSecondary">
								They are kept safe and retried automatically every 24 hours.
							</Text>
						</Box>

						<TouchableOpacity onPress={() => { retryQuarantinedExports(); }}>
							<Box paddingVertical="s" paddingLeft="m">
								<Text variant="caption" color="primary">Retry now</Text>
							</Box>
						</TouchableOpacity>
					</Box>
				)}
				{backgroundExportRunning && (
					<Box marginTop="s" flexDirection="row" alignItems="center">
						<ActivityIndicator size="small" color={theme.colors.primary} />
						<Box marginLeft="s" flex={1}>
							<Text variant="caption" color="textSecondary">
								{pendingExportCount
									? `Exporting ${pendingExportCount} session${pendingExportCount === 1 ? '' : 's'} in the background…`
									: 'Exporting in the background…'}
							</Text>
						</Box>
					</Box>
				)}
				{searchSource === 'localServer' && !searchingLocalServer && (
					<Box marginTop="s">
						<Text variant="caption" color="textSecondary">Showing results from local server</Text>
					</Box>
				)}
            </Content>

			<FlatList
				data={sessions}
				onRefresh={refreshSessions}
				refreshing={loadingSessions}
				keyExtractor={(item: any, index) => `${item.id || item?.data?.unique_key || item?.unique_key || index}`}
				onEndReached={() => { loadMoreSessions(); }}
				// Half a screen of runway: enough to load before the user hits
				// the end, without fetching pages they may never reach.
				onEndReachedThreshold={0.5}
				initialNumToRender={SESSIONS_PAGE_SIZE}
				ListHeaderComponent={() => (
					<Content>
						{filterByDate && (
							<>
								{!!filterMinDate && <Text color="textDisabled" variant="caption">Min date: {moment(filterMinDate).format('LL')}</Text>}
								{!!filterMaxDate && <Text color="textDisabled" variant="caption">Max date: {moment(filterMaxDate).format('LL')}</Text>}
							</>
						)}
						{!!sessions.length && listMode === 'browse' && totalSessions > sessions.length && (
							<Text color="textDisabled" variant="caption">
								Showing {sessions.length} of {totalSessions} sessions
							</Text>
						)}
					</Content>
				)}
				ListFooterComponent={() => (
					!sessions.length ? null : (
						<Content>
							<Box style={{ paddingVertical: 16 }}>
								{loadingMoreSessions ? (
									<ActivityIndicator size="small" color={theme.colors.primary} />
								) : (
									<Text style={{ textAlign: 'center' }} variant="caption" color="textDisabled">
										{hasMoreSessions
											? 'Scroll for more'
											: `${sessions.length} session${sessions.length === 1 ? '' : 's'} shown`}
									</Text>
								)}
							</Box>
						</Content>
					)
				)}
				ListEmptyComponent={() => (
					<Content>
						<Box style={{ paddingVertical: 25 }}>
							<Text style={{ textAlign: 'center', color: '#999' }}>
								{searchingLocalServer
									? 'Searching…'
									: searchValue && localServerChecked && !localServerAvailable
									? 'Historic search unavailable: no local server configured.'
									: searchValue && localServerError
									? 'No results shown - see the message above.'
									: 'No sessions to display'}
							</Text>
						</Box>
					</Content>
				)}

				renderItem={({ item }) => {
					// Rows fetched from the local server are another machine's
					// records: they carry none of this device's export columns,
					// so every delivery flag would read as "pending" and the
					// missing completed_at of a partial record as "interrupted".
					const isLocalServerResult = item.__source === 'localServer';
					const remoteDelivered = !isLocalServerResult && api.isRemoteDelivered(item);
					const remotePending = !isLocalServerResult && api.isExportableSession(item) && !remoteDelivered;
					const exportBlocked = Boolean(
						item.main_export_blocked || item.poll_export_blocked || item.local_export_blocked
					);
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
										if (!item?.id || item.__source === 'localServer') return;
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
										{isLocalServerResult && (
											<>
												<Box flexDirection="row">
													<Box
														backgroundColor="highlight"
														paddingVertical="s"
														paddingHorizontal="m"
														borderRadius="xl"
													>
														<Text
															textAlign="center"
															variant="caption"
															color="grey-900"
														>From Local Server</Text>
													</Box>
												</Box>
												<Br spacing="m" />
											</>
										)}

										{(remoteDelivered || remotePending || !!item.local_export) && (
											<>
												<Box flexDirection="row">
													{remoteDelivered && (
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
													)}

													{remotePending && (
														<Box
															backgroundColor={exportBlocked ? 'error' : 'highlight'}
															paddingVertical="s"
															paddingHorizontal="m"
															borderRadius="xl"
														>
															<Text
																textAlign="center"
																variant="caption"
																color={exportBlocked ? 'successContrastText' : 'grey-900'}
															>{exportBlocked ? 'Export Needs Attention' : 'Cloud Export Pending'}</Text>
														</Box>
													)}

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

										{!isLocalServerResult && !(item?.data?.completed_at || item?.data?.canceled_at) && (
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

										<Box>
											<Text color="textSecondary">Neotree ID</Text>
											<Text>{getSessionUID(item) || 'N/A'}</Text>
										</Box>

										<Br spacing="l" />

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
											<Text>{getSessionScriptTitle(item, 'Unknown script')}</Text>
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
							setFilterMinDate(null);
							setFilterMaxDate(null);
							setFilterByDate(false);
							setOpenFilterModal(false);
							// Back to the paged view rather than a filtered set.
							loadFirstPage();
						}
					},
					{
						label: 'Filter',
						onPress: () => {
							const error = dateRangeError(filterMinDate, filterMaxDate);
							if (error) {
								Alert.alert('Invalid date range', error);
								return;
							}
							const active = Boolean(filterMinDate || filterMaxDate);
							setFilterByDate(active);
							setOpenFilterModal(false);
							if (active) applyDateFilter(filterMinDate, filterMaxDate);
							else loadFirstPage();
						},
					}
				]}
			>
				{renderDateRange(filterMinDate, filterMaxDate, setFilterMinDate, setFilterMaxDate)}
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
							setDeleteMinDate(null);
							setDeleteMaxDate(null);
							setOpenDeleteModal(false);
						}
					},
					{
						label: 'Delete',
						onPress: () => { confirmDeleteSelection(); },
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
						{renderDateRange(deleteMinDate, deleteMaxDate, setDeleteMinDate, setDeleteMaxDate)}
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
							setExportMinDate(null);
							setExportMaxDate(null);
							setShowExportFormats(false);
							setOpenExportModal(false);
						}
					},
					{
						label: showExportFormats ? 'Export' : 'Next',
						onPress: () => {
							if (showExportFormats) {
								if (!validateExportDateRange()) return;
								exportSessions();
								setOpenExportModal(false);
							} else {
								if (!validateExportDateRange()) return;
								setShowExportFormats(true);
							}
						},
					}
				]}
			>
				{showExportFormats ? (
					<>
						{exportFormats.map(t => (
							<React.Fragment key={t.value}>
								<Radio 							
									label={t.label}
									value={t.value}
									checked={t.value === exportFormat}
									onChange={t => setExportFormat(t as string)}
								/>
								<Br spacing="m" />
							</React.Fragment>
						))}

						{exportFormat === 'jsonapi' && (
							<Box marginTop="s" paddingTop="m" borderTopWidth={1} borderColor="divider">
								<Radio
									label="Also save a copy to this tablet"
									value="saveCopy"
									checked={saveCopyOnApiExport}
									onChange={() => setSaveCopyOnApiExport(current => !current)}
								/>
							</Box>
						)}
					</>
				) :
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
						{renderDateRange(exportMinDate, exportMaxDate, setExportMinDate, setExportMaxDate)}
					</>
				)}
			</Modal>

			{(deletingSessions || exportingSessions || loadingSessionDetails) && (
				<OverlayLoader
					label={exportingSessions && exportProgress && exportProgress.total > 1
						? `Exporting ${exportProgress.done} of ${exportProgress.total} sessions…`
						: undefined}
				/>
			)}
		</>
	);
}
