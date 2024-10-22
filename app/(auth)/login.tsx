import { useEffect, useState } from "react";
import { router } from "expo-router";

import { useSyncRemoteData } from "@/hooks/use-sync-remote-data";
import { Text } from "@/components/ui/text";
import { Splash } from "@/components/splash";
import { Loader } from "@/components/loader";
import { VerifyEmailForm } from "./components/verify-email";
import { SignInForm } from "./components/sign-in";
import { AuthContainer } from "./components/container";

export default function LoginScreen() {
    const { remoteSyncing, remoteSynced, syncRemoteErrors, sync } = useSyncRemoteData();

    const [loggedIn, setLoggedIn] = useState(false);
    const [email, setEmail] = useState('');
    const [formType, setFormType] = useState<'verify-email' | 'sign-in' | 'sign-up'>('verify-email');

    useEffect(() => {
        if (!remoteSyncing && remoteSynced && loggedIn) {
            router.replace('/(drawer)')
        }
    }, [remoteSyncing, remoteSynced, loggedIn, router.push]);

    return (
        <>
            {(loggedIn || remoteSyncing) && (
                <Splash>
                    <Loader className="mb-2" />
                    <Text className="text-xs">
                        {syncRemoteErrors?.join?.(', ') || 'Setting up the app, please wait...'}
                    </Text>
                </Splash>
            )}

            <AuthContainer>
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
                            setLoggedIn(true);
                            sync({ clearData: true, force: true, });
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
            </AuthContainer>
        </>
    );
}
