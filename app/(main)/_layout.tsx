import { Stack } from 'expo-router';

export const unstable_settings = {
    anchor: '(drawer)',
};

export default function AuthenticatedLayout() {
    return (
        <Stack>
            <Stack.Screen name="(drawer)" options={{ headerShown: false, }} />
            <Stack.Screen name="script" />
        </Stack>
    );
}