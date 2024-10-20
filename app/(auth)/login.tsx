import { useEffect, useState } from "react";
import { router } from "expo-router";

import { useSyncRemoteData } from "@/hooks/use-sync-remote-data";
import { VerifyEmailForm } from "./components/verify-email";
import { SignInForm } from "./components/sign-in";
import { AuthContainer } from "./components/container";
import { Text } from "@/components/ui/text";

export default function LoginScreen() {
    const { remoteSyncing, remoteSynced, sync } = useSyncRemoteData({ syncOnmount: false, });

    const [email, setEmail] = useState('');
    const [formType, setFormType] = useState<'verify-email' | 'sign-in' | 'sign-up'>('verify-email');

    useEffect(() => {
        if (!remoteSyncing && remoteSynced) {
            router.replace('(drawer)')
        }
    }, [remoteSyncing, remoteSynced, router.push]);

    const forms = (
        <>
            {formType === 'verify-email' && (
                <VerifyEmailForm 
                    email={email}
                    done={({ email, activated }) => {
                        setEmail(email);
                        setFormType(activated ? 'sign-in' : 'sign-up');
                    }}
                />
            )}

            {formType === 'sign-in' && (
                <SignInForm 
                    email={email}
                    done={() => {
                        sync();
                    }}
                    onChangeEmail={() => {
                        setFormType('verify-email');
                    }}
                />
            )}

            {formType === 'sign-up' && (
                <SignInForm 
                    email={email}
                    done={() => {
                        sync();
                    }}
                    onChangeEmail={() => {
                        setFormType('verify-email');
                    }}
                />
            )}
        </>
    );

    return (
        <AuthContainer>
            {!remoteSyncing ? forms : (
                <>
                    <Text className="text-center text-xs">Setting up the app, please wait...</Text>
                </>
            )}
        </AuthContainer>
    );
}
