import React from 'react';
import { Alert, TouchableOpacity, Platform, FlatList, View, Switch } from "react-native";
import Icon from '@expo/vector-icons/MaterialIcons';
import * as types from '../../types';
import * as api from '../../data';
import { Box, useTheme, Content, Text } from '../../components';
import {handleAppCrush} from '../../utils/handleCrashes'

export function Configuration({ navigation }: types.StackNavigationProps<types.HomeRoutes, 'Configuration'>) {
	const theme = useTheme();

	const [configKeys, setConfigKeys] = React.useState<types.ConfigKey[]>([]);
	const [loadingConfigKeys, setLoadingConfigKeys] = React.useState(false);

	const [configuration, setConfiguration] = React.useState<types.Configuration>({});
	const [, setSavingConfiguration] = React.useState(false);

	const getConfigKeys = (opts: any = {}) => new Promise((resolve, reject) => {
		const { loader } = opts;

		(async () => {
		setLoadingConfigKeys((loader === undefined) || loader);
		try {
			const keys = await api.getConfigKeys();
			setConfigKeys(keys || []);
			resolve(keys || []);
		} catch (e: any) {
			Alert.alert(
				'Failed to load config keys',
				e.message || e.msg || JSON.stringify(e),
				[
					{
						text: 'Cancel',
						onPress: () => navigation.navigate('Home'),
					},
					{
						text: 'Try again',
						onPress: () => getConfigKeys(),
					},
				]
			);
			handleAppCrush(e)
			reject(e);
		}
		setLoadingConfigKeys(false);
		})();
	});

	const saveConfiguration = (params: any) => new Promise((resolve, reject) => {
		const conf = { ...configuration, ...params };
		setConfiguration(conf);
		(async () => {
			setSavingConfiguration(true);
			try {
				const rslts = await api.saveConfiguration(conf);
				resolve(rslts);
			} catch (e: any) {
				Alert.alert(
					'Failed to save config keys',
					e.message || e.msg || JSON.stringify(e),
					[
						{
							text: 'Cancel',
							onPress: () => {},
						},
					]
				);
				handleAppCrush(e)
				reject(e);
			}
			setSavingConfiguration(false);
		})();
	});

	React.useEffect(() => {
		(async () => {
			setLoadingConfigKeys(true);

			try {
				const conf = await api.getConfiguration();
				setConfiguration({ ...(conf || {}).data });
			} catch (e) { /* Do nothing */ }

			try { await getConfigKeys(); } catch (e) { /* Do nothing */ }
		})();
	}, []);

	React.useEffect(() => {
		navigation.setOptions({
			headerLeft: ({ tintColor }) => (
				<Box marginLeft="m">
					<TouchableOpacity onPress={() => navigation.navigate('Home')}>
						<Icon 
							name={Platform.OS === 'ios' ? 'arrow-back-ios' : 'arrow-back'}  
							size={28} 
							color={tintColor}
						/>
					</TouchableOpacity>
				</Box>
			),
		});
	}, [navigation, theme]);

	return (
		<Box flex={1} backgroundColor="white">
			<FlatList
				data={configKeys}
				onRefresh={getConfigKeys}
				refreshing={loadingConfigKeys}
				renderItem={({ item }) => {
					const selected = !!configuration[item.data.configKey];
					const onPress = () => saveConfiguration({ [item.data.configKey]: !selected });
					return (
						<Content>
							<Box
								flexDirection="row"
								alignItems="center"
								paddingBottom="m"
								borderBottomWidth={1}
								borderBottomColor="divider"
							>
								<Box style={{ paddingRight:80, }}>
									<Text variant="title3">{item?.data?.label}</Text>
								</Box>

								<View style={{ marginLeft: 'auto' }} />

								<Box>
									<Switch
										value={selected}										
										trackColor={{ false: undefined, true: theme.colors['primary-500'] }}
										thumbColor={selected ? theme.colors.primary : undefined}
										ios_backgroundColor="#3e3e3e" // @ts-ignore
										onValueChange={() => onPress()}
									/>
								</Box>
							</Box>
						</Content>
					);
				}}
				keyExtractor={item => item.id}
				/>
		</Box>
	);
}
