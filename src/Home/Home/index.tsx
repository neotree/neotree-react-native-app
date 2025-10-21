import { useIsFocused } from '@react-navigation/native';
import React from 'react';
import { FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { useAppContext } from '../../AppContext';
import { Content, Text, Card, Br, Box, theme } from '../../components';
import { getLocation, getScripts, syncData } from '../../data';
import * as types from '../../types';

export function Home({ navigation }: types.StackNavigationProps<types.HomeRoutes, 'Home'>) {
	const isFocused = useIsFocused();

	const { application, setSyncDataResponse } = useAppContext() || {};

	const [scriptsInitialised, setScriptsInitialised] = React.useState(false);
	const [loadingScripts, setLoadingScripts] = React.useState(false);
	const [scripts, setScripts] = React.useState<types.Script[]>([]);
	const [isResyncing, setIsResyncing] = React.useState(false);
	const [hasTriedResync, setHasTriedResync] = React.useState(false);
	const [showError, setShowError] = React.useState<string | null>(null);

	const performResync = React.useCallback(async () => {
		if (isResyncing || hasTriedResync) return false;
		
		try {
			setIsResyncing(true);
			setHasTriedResync(true);
			setShowError(null);
			console.log('No scripts found. Performing resync...');
			
			const res = await syncData({ force: true });
			
			if (setSyncDataResponse) {
				setSyncDataResponse(res);
			}
			
			console.log('Resync completed successfully');
			return true;
		} catch (err: any) {
			console.error('Resync failed:', err);
			setShowError(err?.message || 'Failed to resync data');
			return false;
		} finally {
			setIsResyncing(false);
		}
	}, [isResyncing, hasTriedResync, setSyncDataResponse]);

	const loadScripts = React.useCallback(async (showLoader = true) => {
		try {
			if (showLoader) setLoadingScripts(true);
			setShowError(null);
			
			const location = await getLocation();
			const allScripts = await getScripts();

			const selectedHospitalScripts = allScripts.filter(s => s.data?.hospital === location?.hospital);

			// If selectedHospitalScripts is empty and we haven't tried resyncing yet
			if (selectedHospitalScripts.length === 0 && !hasTriedResync && !isResyncing) {
				console.log(`No scripts found for hospital ${location?.hospital}. Triggering resync...`);
				
				const resyncSuccess = await performResync();
				
				if (resyncSuccess) {
					// After successful resync, reload scripts
					const scriptsAfterSync = await getScripts();
					const filteredScripts = scriptsAfterSync.filter(s => s.data?.hospital === location?.hospital);
					
					if (filteredScripts.length === 0) {
						setShowError('No scripts available for this hospital after sync.');
					}
					
					setScripts(filteredScripts);
				}
			} else {
				// Either we have scripts OR we already tried resyncing
				setScripts(selectedHospitalScripts);
				
				if (selectedHospitalScripts.length === 0 && hasTriedResync) {
					setShowError('Failed to load scripts for this hospital.');
				}
			}

			setLoadingScripts(false);
			setScriptsInitialised(true);
		} catch (err: any) {
			console.error('Load scripts error:', err);
			setShowError(err?.message || 'Failed to load scripts');
			setLoadingScripts(false);
		}
	}, [hasTriedResync, isResyncing, performResync]);

	const handleManualRefresh = React.useCallback(() => {
		// Reset the resync flag to allow retry on manual refresh
		setHasTriedResync(false);
		loadScripts(true);
	}, [loadScripts]);

	React.useEffect(() => { 
		if (isFocused) {
			loadScripts();
		}
	}, [isFocused]);

	React.useEffect(() => { 
		if (isFocused && scriptsInitialised) {
			loadScripts(false);
		}
	}, [isFocused, scriptsInitialised, application]);

	if (isResyncing) {
		return (
			<Box
				flex={1}
				justifyContent="center"
				alignItems="center"
				marginVertical="l"
			>
				<ActivityIndicator size="large" />
				<Br spacing="m" />
				<Text variant="title3">Syncing data...</Text>
				<Br spacing="s" />
				<Text color="textSecondary" textAlign="center">
					Fetching latest scripts from server
				</Text>
			</Box>
		);
	}

	if (showError && scripts.length === 0 && !loadingScripts) {
		return (
			<Box
				flex={1}
				justifyContent="center"
				alignItems="center"
				marginVertical="l"
				paddingHorizontal="l"
			>
				<Content>
					<Card>
						<Text variant="title3"  textAlign="center">
							{showError}
						</Text>
						<Br spacing="l" />
					
						<TouchableOpacity
							onPress={handleManualRefresh}
							style={{
								padding: 12,
								backgroundColor: theme.colors.primary,
								borderRadius: 8,
								alignItems: 'center',
							}}
						>
							<Text style={{ color: 'white', fontWeight: 'bold' }}>
								Retry
							</Text>
						</TouchableOpacity>
					</Card>
				</Content>
			</Box>
		);
	}

	return (
		<Box marginVertical="l">
			<FlatList
				onRefresh={handleManualRefresh}
				refreshing={loadingScripts}
				data={scripts}
				keyExtractor={s => s.script_id}
				renderItem={({ item }) => {
					return (
						<Content>
							<TouchableOpacity
								onPress={() => navigation.navigate('Script', {
									script_id: item.script_id,
								})}
							>
								<Card>
									<Text variant="title3">{item.data?.title}</Text>
									<Br spacing='s'/>
									<Text color="textSecondary">{item.data?.description}</Text>
								</Card>
							</TouchableOpacity>
						</Content>
					);
				}}
				ListEmptyComponent={
					!loadingScripts ? (
						<Content>
							<Card>
								<Text variant="title3" textAlign="center">
									No scripts available for your hospital.
								</Text>
								<Br spacing="s" />
								<Text color="textSecondary" textAlign="center">
									Pull down to refresh
								</Text>
							</Card>
						</Content>
					) : null
				}
			/>
		</Box>
	);
}