import { useRef, useState } from "react";
import { View, TextInput, TouchableOpacity } from "react-native";
import { Controller, useForm } from "react-hook-form";
import clsx from "clsx";

import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { CHANGE_EMAIL_ADDRESS, EMAIL_ADDRESS, PASSWORD, SIGN_IN } from "@/constants/copy";

type Props = {
    email: string;
    done: () => void;
    onChangeEmail: () => void;
};

export function SignInForm({ email, done, onChangeEmail, }: Props) {
    const [loading, setLoading] = useState(false);

    const {
        control,
        handleSubmit,
    } = useForm({
        defaultValues: {
            password: '',
        },
    });

    const submit = handleSubmit(async () => {
        try {
            setLoading(true);
            done();
        } catch(e: any) {

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
