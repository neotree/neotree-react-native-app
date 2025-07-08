import { SafeAreaView } from "react-native";

type Props = {
    children: React.ReactNode;
};

export function SessionsLayout({ children }: Props) {
    return (
        <>
            <SafeAreaView style={{ flex: 1, }}>
                {children}
            </SafeAreaView>
        </>
    );
}
