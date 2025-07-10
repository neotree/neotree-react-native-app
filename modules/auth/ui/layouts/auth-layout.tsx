import { View } from "react-native";

type Props = {
    children: React.ReactNode;
};

export function AuthLayout({ children }: Props) {
    return (
        <>
            <View style={{ flex: 1, }}>
                {children}
            </View>
        </>
    );
}
