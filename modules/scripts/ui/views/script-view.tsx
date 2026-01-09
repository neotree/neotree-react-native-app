import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function ScriptView() {
    return (
        <SafeAreaView 
            className="flex-1 items-center justify-center"
        >
            <Text className="text-5xl">Script</Text>
        </SafeAreaView>
    );
}