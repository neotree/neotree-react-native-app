import { useRef, useState } from "react";
import { View, TextInput } from "react-native";
import { Controller, useForm } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";

type Props = {
    done: (params: { email: string; activated: boolean; }) => void;
};

export function VerifyEmailForm({ done }: Props) {
    const [loading, setLoading] = useState(false);

    const emailInputRef = useRef<TextInput>(null);

    const {
        control,
        handleSubmit,
    } = useForm({
        defaultValues: {
            email: '',
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
            <View className="mb-3">
                <Controller 
                    control={control}
                    name="email"
                    rules={{ required: true, }}
                    render={({ field: { value, onChange }, }) => {
                        return (
                            <Input 
                                editable={!loading}
                                placeholder="Email Address"
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
            </View>

            <View>
                <Button
                    disabled={loading}
                    onPress={submit}
                >
                    Verify email address
                </Button>
            </View>
        </>
    );
}
