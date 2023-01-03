import { useIsFocused } from '@react-navigation/native';
import React from 'react';
import { FlatList, TouchableOpacity } from "react-native";
import { Content, Text, Card, Br, Box } from '../../components';
import { getScripts } from '../../data';
import * as types from '../../types';

export function Home({ navigation }: types.StackNavigationProps<types.HomeRoutes, 'Home'>) {
	const isFocused = useIsFocused();

	const [loadingScripts, setLoadingScripts] = React.useState(false);
	const [scripts, setScripts] = React.useState<types.Script[]>([]);

	const loadScripts = React.useCallback(() => {
		(async () => {
			setLoadingScripts(true);
			const scripts = await getScripts();
			setScripts(scripts);
			setLoadingScripts(false);
		})();
	}, []);

	React.useEffect(() => { if (isFocused) loadScripts(); }, [isFocused]);

	return (
		<Box
			marginVertical="l"
		>
			<FlatList
				onRefresh={loadScripts}
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
									<Text
										variant="title3"
									>{item.data?.title}</Text>

									<Br />

									<Text
										color="textSecondary"
									>{item.data?.description}</Text>
								</Card>
							</TouchableOpacity>
						</Content>
					);
				}}
			/>
		</Box>
	);
}
