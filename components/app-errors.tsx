import { Text, View } from "react-native";

export function AppErrors({ errors }: { errors: string[]; }) {
    return (
        <View
            style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            {errors.map((e, i) => {
                return (
                    <Text 
                        key={i}
                    >{e}</Text>
                );
            })}
        </View>
    );
}
