import { ScrollView, Text, View } from "react-native";

export function Script() {
	return (
		<ScrollView>
			<View 
				style={{
					height: 400,
					justifyContent: 'center',
					alignItems: 'center',
				}}
			>
				<Text style={{ fontSize: 30 }}>Script</Text>
			</View>
		</ScrollView>
	);
}
