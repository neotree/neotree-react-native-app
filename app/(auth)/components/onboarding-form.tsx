import { useMemo, useState } from "react";
import { View } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { router } from "expo-router";

import { CONFIG } from '@/constants';
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { useAsyncStorage } from "@/hooks/use-async-storage";
import { CONTINUE, COUNTRIES, COUNTRY, HOSPITAL, HOSPITALS } from "@/constants/copy";
import { Dropdown, DropdownContent, DropdownItem, DropdownTrigger } from "@/components/ui/dropdown";
import { useHospitals } from "@/hooks/use-hospitals";

export function OnboardingForm() {
    const [loading, setLoading] = useState(false);

    const { COUNTRY_ISO, HOSPITAL_ID, itemsUpdating, setItems } = useAsyncStorage();
    const { hospitals, loadHospitalsErrors, hospitalsLoading } = useHospitals();

    const {
        control,
        handleSubmit,
    } = useForm({
        defaultValues: {
            hospitalId: '',
            countryISO: COUNTRY_ISO,
        },
    });

    const submit = handleSubmit(async (data) => {
        try {
            router.push('/(auth)/login');
        } catch(e: any) {

        } finally {
            setLoading(false);
        }
    });

    const disableCountry = useMemo(() => loading || itemsUpdating || hospitalsLoading || (CONFIG.sites.length < 2), [
        hospitalsLoading, 
        itemsUpdating,
        loading,
    ]);

    const disableHospitals = useMemo(() => loading || !!loadHospitalsErrors?.length || hospitalsLoading || itemsUpdating, [
        loadHospitalsErrors, 
        hospitalsLoading,
        itemsUpdating,
        loading,
    ]);

    const canSubmit = useMemo(() => !loading && !!(COUNTRY_ISO && HOSPITAL_ID), [
        loading,
        COUNTRY_ISO, 
        HOSPITAL_ID,
    ]);

    const hospitalsOptions = useMemo(() => {
        return hospitals.map(o => ({ ...o, hospitalId: o.oldHospitalId || o.hospitalId, }));
    }, [hospitals]);
    
    return (
        <>
            <View className="mb-3">
                <Text variant={disableCountry ? 'labelDisabled' : 'label'}>{COUNTRY}</Text>
                <Controller 
                    control={control}
                    name="countryISO"
                    rules={{ required: true, }}
                    render={({ field: { value, onChange }, }) => {
                        return (
                            <>
                                <Dropdown
                                    selected={value}
                                    onSelect={value => {
                                        onChange(value);
                                        setItems({ 
                                            COUNTRY_ISO: `${value || ''}`, 
                                            COUNTRY_NAME: CONFIG.sites.filter(c => c.countryISO === value)[0]?.countryName || '',
                                        });
                                    }}
                                    disabled={disableCountry}
                                    title={COUNTRIES}
                                >
                                    <DropdownTrigger>
                                        Select country
                                    </DropdownTrigger>
                                    <DropdownContent>
                                        {CONFIG.sites.map(o => (
                                            <DropdownItem key={o.countryISO} value={o.countryISO}>
                                                {o.countryName}
                                            </DropdownItem>
                                        ))}
                                    </DropdownContent>
                                </Dropdown>
                            </>
                        );
                    }}
                />
            </View>

            <View className="mb-3">
                <Text 
                    variant={disableHospitals ? 'labelDisabled' : 'label'}
                >{HOSPITAL}</Text>
                <Controller 
                    control={control}
                    name="hospitalId"
                    rules={{ required: true, }}
                    disabled={disableHospitals}
                    render={({ field: { value, onChange }, }) => {
                        return (
                            <>
                                <Dropdown
                                    searchable
                                    searchPlaceholder="Search hospitals"
                                    selected={value}
                                    onSelect={value => {
                                        onChange(value);
                                        setItems({ 
                                            HOSPITAL_ID: `${value || ''}`, 
                                            HOSPITAL_NAME: hospitalsOptions.filter(h => h.hospitalId === value)[0]?.name || '',
                                        });
                                    }}
                                    title={HOSPITALS}
                                >
                                    <DropdownTrigger>
                                        Select hospital
                                    </DropdownTrigger>
                                    <DropdownContent>
                                        {hospitalsOptions.map(o => (
                                                <DropdownItem 
                                                    key={o.hospitalId} 
                                                    value={o.hospitalId}
                                                >
                                                    {o.name}
                                                </DropdownItem>
                                            ))}
                                    </DropdownContent>
                                </Dropdown>
                            </>
                        );
                    }}
                />
                {!!loadHospitalsErrors?.length && <Text className="text-xs text-danger mt-1">{loadHospitalsErrors.join(', ')}</Text>}
            </View>

            <View>
                <Button
                    onPress={submit}
                    disabled={!canSubmit}
                >
                    {CONTINUE}
                </Button>
            </View>
        </>
    );
}
