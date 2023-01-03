import React from 'react';
import { View, Text } from 'react-native';

export function HomeNavigator() {
	return (
		<View style={{ flex: 1 }}>
			<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
				<Text style={{ fontSize: 30 }}>Home</Text>
			</View>
		</View>
	);
}

