import { useRef, useState } from "react";
import { View, TextInput, TouchableOpacity } from "react-native";
import { Controller, useForm } from "react-hook-form";
import clsx from "clsx";

import { getAxiosClient } from "@/lib/axios";
import { useAlertModal } from "@/hooks/use-alert-modal";
import { DataResponse } from "@/types";
import { useAsyncStorage } from "@/hooks/use-async-storage";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { CHANGE_EMAIL_ADDRESS, CONFIRM_PASSWORD, EMAIL_ADDRESS, PASSWORD, SIGN_IN } from "@/constants/copy";

type Props = {
    email: string;
    done: () => void;
    onChangeEmail: () => void;
};

export function SignUpForm({ email, done, onChangeEmail, }: Props) {
    const { alert } = useAlertModal();
    const { setItems: setAsyncStorageItems } = useAsyncStorage();

    const [loading, setLoading] = useState(false);
	const passwordConfirmInputRef = useRef<TextInput>(null);

    const {
        control,
        handleSubmit,
    } = useForm({
        defaultValues: {
            password: '',
            passwordConfirm: '',
        },
    });

    const submit = handleSubmit(async (data) => {
        try {
            setLoading(true);

            const axios = await getAxiosClient();
            const res = await axios.post<DataResponse<null | { bearerToken: string; }>>('/api/app/auth/sign-up', {
                ...data,
                email
            });
            const { data: info, errors } = res.data;

            if (errors?.length) throw new Error(errors.join(', '));

            await setAsyncStorageItems({ BEARER_TOKEN: info?.bearerToken || '', });
            
            done();
        } catch(e: any) {
            alert({
                variant: 'error',
                message: e.message,
                title: 'Sign up',
            });
        } finally {
            setLoading(false);
        }
    });

    return (
        <>
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
                <Controller 
                    control={control}
                    name="password"
                    rules={{ required: true, }}
                    render={({ field: { value, onChange }, }) => {
                        return (
                            <Input 
                                editable={!loading}
                                placeholder={PASSWORD}
                                value={value}
                                onChangeText={password => onChange(password)}
                                secureTextEntry
                                textContentType="password"
                                autoCapitalize="none"
                                returnKeyType="go"
                                onSubmitEditing={() => passwordConfirmInputRef.current?.focus?.()}
                            />
                        );
                    }}
                />
            </View>

            <View className="mb-3">
                <Controller 
                    control={control}
                    name="passwordConfirm"
                    rules={{ required: true, }}
                    render={({ field: { value, onChange }, }) => {
                        return (
                            <Input 
                                editable={!loading}
                                placeholder={CONFIRM_PASSWORD}
                                ref={passwordConfirmInputRef}
                                value={value}
                                onChangeText={password2 => onChange(password2)}
                                secureTextEntry
                                textContentType="password"
                                autoCapitalize="none"
                                returnKeyType="go"
                                onSubmitEditing={() => submit()}
                            />
                        );
                    }}
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
                onPress={() => onChangeEmail()}
            >
                <Text
                    className={clsx(
                        'text-center text-sm opacity-50',
                        loading && 'opacity-50',
                    )}
                >{CHANGE_EMAIL_ADDRESS}</Text>
            </TouchableOpacity>
        </>
    );
}
