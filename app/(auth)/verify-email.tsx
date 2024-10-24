import { useCallback, useRef, useState } from "react";
import { View, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import { getAxiosClient } from "@/lib/axios";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { EMAIL_ADDRESS, VERIFY_EMAIL_ADDRESS } from "@/constants/copy";
import { DataResponse } from "@/types";
import { useAlertModal } from "@/hooks/use-alert-modal";
import { AuthContainer } from "./components/container";

export default function VerifyEmailScreen() {
    const { email } = useLocalSearchParams<{ email?: string; }>();
    const { alert } = useAlertModal();

    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        email: email || '',
    });

    const emailInputRef = useRef<TextInput>(null);

    const submit = useCallback(async () => {
        try {
            setLoading(true);
            
            const axios = await getAxiosClient();
            const res = await axios.post<DataResponse<null | { userId: string; isActive: boolean; }>>('/api/app/auth/verify-email', form);
            const { data: info, errors } = res.data;

            if (errors?.length) throw new Error(errors.join(', '));

            router.replace({
                pathname: !!info?.isActive ? '/(auth)/sign-in' : '/(auth)/sign-up',
                params: { ...form, },
            });
        } catch(e: any) {
            alert({
                variant: 'error',
                message: e.message,
                title: 'Verify email address',
            });
        } finally {
            setLoading(false);
        }
    }, [form, router.replace, alert]);

    return (
        <AuthContainer>
            <KeyboardAvoidingView 
                className="mb-3"
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <Input 
                    editable={!loading}
                    placeholder={EMAIL_ADDRESS}
                    ref={emailInputRef}
                    value={form.email}
                    onChangeText={email => setForm(prev => ({ ...prev, email, }))}
                    keyboardType="email-address"
                    textContentType="username"
                    autoCapitalize="none"
                    returnKeyType="next"
                    onSubmitEditing={() => submit()}
                />
            </KeyboardAvoidingView>

            <View>
                <Button
                    disabled={loading}
                    onPress={submit}
                >
                    {VERIFY_EMAIL_ADDRESS}
                </Button>
            </View>
        </AuthContainer>
    );
}
