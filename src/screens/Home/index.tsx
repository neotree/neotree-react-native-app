import { ScrollView, Text, View } from "react-native";

export function Home() {
	return (
		<ScrollView>
			<View 
				style={{
					height: 400,
					justifyContent: 'center',
					alignItems: 'center',
				}}
			>
				<Text style={{ fontSize: 30 }}>Home</Text>
			</View>
		</ScrollView>
	);
}
