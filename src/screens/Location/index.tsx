import { ScrollView, Text, View } from "react-native";

export const locationAssets = [];

export function Location() {
	return (
		<ScrollView>
			<View 
				style={{
					height: 400,
					justifyContent: 'center',
					alignItems: 'center',
				}}
			>
				<Text style={{ fontSize: 30 }}>Location</Text>
			</View>
		</ScrollView>
	);
}
