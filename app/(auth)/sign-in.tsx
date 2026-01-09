import { AuthPageLayout } from '@/modules/auth/ui/layouts/auth-page-layout';
import { SignInView } from '@/modules/auth/ui/views/sign-in-view';

export default function SignInScreen() {
    return (
        <AuthPageLayout>
            <SignInView />
        </AuthPageLayout>
    );
}