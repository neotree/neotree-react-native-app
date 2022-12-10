import { ScrollView, Text, View } from "react-native";

export const configurationAssets = [];

export function Configuration() {
	return (
		<ScrollView>
			<View 
				style={{
					height: 400,
					justifyContent: 'center',
					alignItems: 'center',
				}}
			>
				<Text style={{ fontSize: 30 }}>Configuration</Text>
			</View>
		</ScrollView>
	);
}
