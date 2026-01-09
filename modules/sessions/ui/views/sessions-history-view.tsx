import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function SessionsHistoryView() {
    return (
        <SafeAreaView 
            className="flex-1 items-center justify-center"
        >
            <Text className="text-5xl">History</Text>
        </SafeAreaView>
    );
}