import { AuthPageLayout } from '@/modules/auth/ui/layouts/auth-page-layout';
import { OnboardingView } from '@/modules/auth/ui/views/onboarding-view';

export default function SignInScreen() {
    return (
        <AuthPageLayout>
            <OnboardingView />
        </AuthPageLayout>
    );
}
