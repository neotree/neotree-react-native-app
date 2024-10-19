import { OnboardingForm } from "./components/onboarding-form";
import { AuthContainer } from "./components/container";

export default function OnboardingScreen() {
    return (
        <AuthContainer>
            <OnboardingForm />
        </AuthContainer>
    );
}
