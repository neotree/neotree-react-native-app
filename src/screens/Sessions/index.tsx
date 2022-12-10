import { ScrollView, Text, View } from "react-native";

export const sessionsAssets = [];

export function Sessions() {
	return (
		<ScrollView>
			<View 
				style={{
					height: 400,
					justifyContent: 'center',
					alignItems: 'center',
				}}
			>
				<Text style={{ fontSize: 30 }}>Sessions</Text>
			</View>
		</ScrollView>
	);
}
