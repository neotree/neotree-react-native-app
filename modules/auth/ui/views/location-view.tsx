import { Text, View } from "react-native";

type Props = {};

export function LocationView({}: Props) {
    return (
        <>
            <View
                className="
                    flex-1
                    justify-end
                    items-center
                "
            >
                <View
                    className="
                        pb-24
                        w-full
                        max-w-[400px]
                    "
                >
                    <Text className="text-[red]">Location</Text>
                </View>
            </View>
        </>
    );
}
