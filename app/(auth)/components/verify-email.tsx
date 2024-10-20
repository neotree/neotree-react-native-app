import { useRef, useState } from "react";
import { View, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { Controller, useForm } from "react-hook-form";

import { getAxiosClient } from "@/lib/axios";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { EMAIL_ADDRESS, VERIFY_EMAIL_ADDRESS } from "@/constants/copy";
import { DataResponse } from "@/types";
import { useAlertModal } from "@/hooks/use-alert-modal";

type Props = {
    email: string;
    done: (params: { email: string; activated: boolean; }) => void;
};

export function VerifyEmailForm({ email, done }: Props) {
    const { alert } = useAlertModal();

    const [loading, setLoading] = useState(false);

    const emailInputRef = useRef<TextInput>(null);

    const {
        control,
        handleSubmit,
    } = useForm({
        defaultValues: {
            email: email || '',
        },
    });

    const submit = handleSubmit(async (data) => {
        try {
            setLoading(true);
            
            const axios = await getAxiosClient();
            const res = await axios.post<DataResponse<null | { userId: string; isActive: boolean; }>>('/api/app/auth/verify-email', data);
            const { data: info, errors } = res.data;

            if (errors?.length) throw new Error(errors.join(', '));
            
            done({ email: data.email, activated: !!info?.isActive, });
        } catch(e: any) {
            alert({
                variant: 'error',
                message: e.message,
                title: 'Verify email address',
            });
        } finally {
            setLoading(false);
        }
    });

    return (
        <>
            <KeyboardAvoidingView 
                className="mb-3"
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <Controller 
                    control={control}
                    name="email"
                    rules={{ required: true, }}
                    render={({ field: { value, onChange }, }) => {
                        return (
                            <Input 
                                editable={!loading}
                                placeholder={EMAIL_ADDRESS}
                                ref={emailInputRef}
                                value={value}
                                onChangeText={email => onChange(email)}
                                keyboardType="email-address"
                                textContentType="username"
                                autoCapitalize="none"
                                returnKeyType="next"
                                onSubmitEditing={() => submit()}
                            />
                        );
                    }}
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
        </>
    );
}
