import { SafeAreaView } from "react-native";

type Props = {
    children: React.ReactNode;
};

export function SessionsLayout({ children }: Props) {
    return (
        <>
            <SafeAreaView 
                style={{ flex: 1, }}
                className="bg-red-200"
            >
                {children}
            </SafeAreaView>
        </>
    );
}
