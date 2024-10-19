import { useRef, useState } from "react";
import { View, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { Controller, useForm } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { EMAIL_ADDRESS, VERIFY_EMAIL_ADDRESS } from "@/constants/copy";

type Props = {
    email: string;
    done: (params: { email: string; activated: boolean; }) => void;
};

export function VerifyEmailForm({ email, done }: Props) {
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
            done({ email: data.email, activated: true, });
        } catch(e: any) {

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
