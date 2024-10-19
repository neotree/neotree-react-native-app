import { useRef, useState } from "react";
import { View } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { router } from "expo-router";

import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { useAsyncStorage } from "@/hooks/use-async-storage";
import { CONTINUE } from "@/constants/copy";
import { Dropdown, DropdownContent, DropdownItem, DropdownTrigger } from "@/components/ui/dropdown";

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
                                <Dropdown>
                                    <DropdownTrigger>
                                        Select hospital
                                    </DropdownTrigger>
                                    <DropdownContent>
                                        {(() => {
                                            const items: any[] = [];
                                            for (let i = 0; i < 2; i++) {
                                                items.push({ value: `${i + 1}`, label: `Item ${i + 1}`, }); 
                                            }
                                            return items.map(o => (
                                                <DropdownItem key={o.value} value={o.value}>{o.label}</DropdownItem>
                                            ));
                                        })()}
                                    </DropdownContent>
                                </Dropdown>
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
