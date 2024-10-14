import { SafeAreaView, Text } from "react-native";

import { useHospitals } from "@/hooks/use-hospitals";

export default function OnboardingScreen() {
    const { hospitalsLoading, loadHospitalsErrors, hospitals, } = useHospitals();

    return (
        <SafeAreaView>
            <Text>Onboarding</Text>
        </SafeAreaView>
    );
}
