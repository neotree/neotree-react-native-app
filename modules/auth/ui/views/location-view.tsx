import { Text, View } from "react-native";

type Props = {};

export function LocationView({}: Props) {
    return (
        <>
            <View style={{ flex: 1, }} className="bg-[red]">
                <Text className="text-[red]">Location</Text>
            </View>
        </>
    );
}
