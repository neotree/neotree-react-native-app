import { useRef, useState } from "react";
import { View } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { router } from "expo-router";

import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { useAsyncStorage } from "@/hooks/use-async-storage";
import { CONTINUE } from "@/constants/copy";

export function OnboardingForm() {
    const [loading, setLoading] = useState(false);

    const { COUNTRY_ISO, HOSPITAL_ID } = useAsyncStorage();

    console.log('useAsyncStorage', { COUNTRY_ISO, HOSPITAL_ID, });

    const {
        control,
        handleSubmit,
    } = useForm({
        defaultValues: {
            hospitalId: HOSPITAL_ID || '',
            countryISO: COUNTRY_ISO,
        },
    });

    const submit = handleSubmit(async (data) => {
        try {
            router.push('(auth)/login');
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
                    name="hospitalId"
                    rules={{ required: true, }}
                    render={({ field: { value, onChange }, }) => {
                        return (
                            <>
                            
                            </>
                        );
                    }}
                />
            </View>

            <View className="mb-3">
                <Controller 
                    control={control}
                    name="countryISO"
                    rules={{ required: true, }}
                    render={({ field: { value, onChange }, }) => {
                        return (
                            <>
                            
                            </>
                        );
                    }}
                />
            </View>

            <View>
                <Button
                    disabled={loading}
                    onPress={submit}
                >
                    {CONTINUE}
                </Button>
            </View>
        </>
    );
}
