import { useRef, useState } from "react";
import { View, TextInput, TouchableOpacity } from "react-native";
import { Controller, useForm } from "react-hook-form";
import clsx from "clsx";

import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";

type Props = {
    email: string;
    done: () => void;
    onChangeEmail: () => void;
};

export function SignUpForm({ email, done, onChangeEmail, }: Props) {
    const [loading, setLoading] = useState(false);
	const confirmPasswordInputRef = useRef<TextInput>(null);

    const {
        control,
        handleSubmit,
    } = useForm({
        defaultValues: {
            password: '',
            confirmPassword: '',
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
                    placeholder="Email Address"
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
                                placeholder="Password"
                                value={value}
                                onChangeText={password => onChange(password)}
                                secureTextEntry
                                textContentType="password"
                                autoCapitalize="none"
                                returnKeyType="go"
                                onSubmitEditing={() => confirmPasswordInputRef.current?.focus?.()}
                            />
                        );
                    }}
                />
            </View>

            <View className="mb-3">
                <Controller 
                    control={control}
                    name="confirmPassword"
                    rules={{ required: true, }}
                    render={({ field: { value, onChange }, }) => {
                        return (
                            <Input 
                                editable={!loading}
                                placeholder="Confirm password"
                                ref={confirmPasswordInputRef}
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
                    Sign in
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
                >Change email address</Text>
            </TouchableOpacity>
        </>
    );
}
