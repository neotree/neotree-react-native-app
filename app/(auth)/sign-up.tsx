import { useCallback, useRef, useState } from "react";
import { View, TextInput, TouchableOpacity } from "react-native";
import clsx from "clsx";
import { router, useLocalSearchParams } from "expo-router";

import { getAxiosClient } from "@/lib/axios";
import { useAlertModal } from "@/hooks/use-alert-modal";
import { DataResponse } from "@/types";
import { useAsyncStorage } from "@/hooks/use-async-storage";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { CHANGE_EMAIL_ADDRESS, CONFIRM_PASSWORD, EMAIL_ADDRESS, PASSWORD, SIGN_IN } from "@/constants/copy";
import { AuthContainer } from "./components/container";

export default function SignUpScreen() {
    const { email } = useLocalSearchParams<{ email: string; }>();

    const { alert } = useAlertModal();
    const { setItems: setAsyncStorageItems } = useAsyncStorage();

    const [loading, setLoading] = useState(false);
	const passwordConfirmInputRef = useRef<TextInput>(null);

    const [form, setForm] = useState({
        password: '',
        passwordConfirm: '',
    });

    const submit = useCallback(async () => {
        try {
            setLoading(true);

            const axios = await getAxiosClient();
            const res = await axios.post<DataResponse<null | { bearerToken: string; }>>('/api/app/auth/sign-up', {
                ...form,
                email
            });
            const { data: info, errors } = res.data;

            if (errors?.length) throw new Error(errors.join(', '));

            await setAsyncStorageItems({ BEARER_TOKEN: info?.bearerToken || '', });
            
            router.replace('/(auth)/welcome');
        } catch(e: any) {
            alert({
                variant: 'error',
                message: e.message,
                title: 'Sign up',
            });
        } finally {
            setLoading(false);
        }
    }, [form, router.replace, setAsyncStorageItems, alert]);

    return (
        <AuthContainer>
            <View className="mb-3">
                <Input 
                    editable={false}
                    placeholder={EMAIL_ADDRESS}
                    value={email}
                    keyboardType="email-address"
                    textContentType="username"
                    autoCapitalize="none"
                    returnKeyType="next"
                />
            </View>

            <View className="mb-3">
                <Input 
                    editable={!loading}
                    placeholder={PASSWORD}
                    value={form.password}
                    onChangeText={password => setForm(prev => ({ ...prev, password, }))}
                    secureTextEntry
                    textContentType="password"
                    autoCapitalize="none"
                    returnKeyType="go"
                    onSubmitEditing={() => passwordConfirmInputRef.current?.focus?.()}
                />
            </View>

            <View className="mb-3">
                <Input 
                    editable={!loading}
                    placeholder={CONFIRM_PASSWORD}
                    ref={passwordConfirmInputRef}
                    value={form.passwordConfirm}
                    onChangeText={passwordConfirm => setForm(prev => ({ ...prev, passwordConfirm, }))}
                    secureTextEntry
                    textContentType="password"
                    autoCapitalize="none"
                    returnKeyType="go"
                    onSubmitEditing={() => submit()}
                />
            </View>

            <View className="mb-3">
                <Button 
                    disabled={loading}
                    onPress={() => submit()}
                >
                    {SIGN_IN}
                </Button>
            </View>

            <TouchableOpacity
                disabled={loading}
                onPress={() => router.replace({
                    pathname: '/(auth)/verify-email',
                    params: { email, },
                })}
            >
                <Text
                    className={clsx(
                        'text-center text-sm opacity-50',
                        loading && 'opacity-50',
                    )}
                >{CHANGE_EMAIL_ADDRESS}</Text>
            </TouchableOpacity>
        </AuthContainer>
    );
}
