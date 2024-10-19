import { useState } from "react";
import { router } from "expo-router";

import { VerifyEmailForm } from "./components/verify-email";
import { SignInForm } from "./components/sign-in";
import { AuthContainer } from "./components/container";

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [formType, setFormType] = useState<'verify-email' | 'sign-in' | 'sign-up'>('verify-email');

    return (
        <>
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
                            router.push('(drawer)');
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
                            router.push('(drawer)');
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
