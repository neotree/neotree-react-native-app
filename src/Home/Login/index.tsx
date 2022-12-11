import { ScrollView, Text, View } from "react-native";

export function Login() {
	return (
		<ScrollView>
			<View 
				style={{
					height: 400,
					justifyContent: 'center',
					alignItems: 'center',
				}}
			>
				<Text style={{ fontSize: 30 }}>Login</Text>
			</View>
		</ScrollView>
	);
}
