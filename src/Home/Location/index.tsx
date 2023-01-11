import React from 'react';
import { ScrollView, TouchableOpacity, Platform } from "react-native";
import Icon from '@expo/vector-icons/MaterialIcons';
import { useAppContext } from '../../AppContext';
import { Content, LocationForm, OverlayLoader, Box } from "../../components";
import * as api from '../../data';
import * as types from '../../types';

export function Location({ navigation }: types.StackNavigationProps<types.HomeRoutes, 'Configuration'>) {
	const ctx = useAppContext();
	const [displayLoader, setDisplayLoader] = React.useState(false);

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
	}, [navigation]);

	return (
		<>
			<ScrollView>
				<Content>
					<LocationForm 
						onSetLocation={() => {
							(async () => {
								setDisplayLoader(true);
								const res = await api.syncData({ force: true, });
								ctx?.setSyncDataResponse(res);
								setDisplayLoader(false);
							})();
						}}
					/>
				</Content>
			</ScrollView>
			
			{displayLoader && <OverlayLoader />}
		</>
	);
}
