import { AuthPageLayout } from '@/modules/auth/ui/layouts/auth-page-layout';
import { ForgotPasswordView } from '@/modules/auth/ui/views/forgot-password-view';

export default function ForgotPasswordScreen() {
    return (
        <AuthPageLayout>
            <ForgotPasswordView />
        </AuthPageLayout>
    );
}