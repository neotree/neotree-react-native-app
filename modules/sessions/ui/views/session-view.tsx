import { Text, View } from "react-native";

type Props = {};

export function SessionView({}: Props) {
    return (
        <>
            <View style={{ flex: 1, }}>
                <Text>Single session</Text>
            </View>
        </>
    );
}
