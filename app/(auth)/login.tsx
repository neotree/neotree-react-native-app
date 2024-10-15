import { useState } from "react";
import { router } from "expo-router";
import { View } from "react-native";

import { Poster } from "@/components/poster";
import { Content } from "@/components/content";
import { VerifyEmailForm } from "./components/verify-email";
import { SignInForm } from "./components/sign-in";

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [formType, setFormType] = useState<'verify-email' | 'sign-in' | 'sign-up'>('verify-email');

    return (
        <>
            <Poster>
                <Content className="py-10">
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
                </Content>
            </Poster>
        </>
    );
}
