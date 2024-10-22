import { useEffect, useMemo, useRef, useState } from "react";
import { View } from "react-native";
import { Controller, useForm } from "react-hook-form";

import { useHospitals } from "@/hooks/use-hospitals";
import { useNetInfo } from "@/hooks/use-netinfo";
import { useAsyncStorage } from "@/hooks/use-async-storage";
import { useSyncRemoteData } from '@/hooks/use-sync-remote-data';
import { Header } from "@/components/header";
import { CONFIG } from '@/constants';
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { COUNTRIES, COUNTRY, HOSPITAL, HOSPITALS, SAVE_CHANGES } from "@/constants/copy";
import { Dropdown, DropdownContent, DropdownItem, DropdownTrigger } from "@/components/ui/dropdown";
import { Content } from "@/components/content";

export default function LocationScreen() {
    const [loading, setLoading] = useState(false);
    const { sync } = useSyncRemoteData();
    const { COUNTRY_ISO, COUNTRY_NAME, HOSPITAL_ID, HOSPITAL_NAME, itemsUpdating, setItems } = useAsyncStorage();
    const { hospitals, loadHospitalsErrors, hospitalsLoading, getHospitals } = useHospitals();
    const { hasInternet } = useNetInfo();

    useEffect(() => { if (hasInternet) getHospitals(); }, [hasInternet, getHospitals]);

    const {
        control,
        setValue,
        handleSubmit,
    } = useForm({
        defaultValues: {
            HOSPITAL_ID,
            HOSPITAL_NAME,
            COUNTRY_ISO,
            COUNTRY_NAME,
        },
    });

    const submit = handleSubmit(async (data) => {
        try {
            setLoading(true);
            await setItems({ ...data });
            sync({ force: true, });
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
        return [
            { name: HOSPITAL_NAME, hospitalId: HOSPITAL_ID, },
            ...hospitals
                .map(o => ({ ...o, hospitalId: o.oldHospitalId || o.hospitalId, }))
                .filter(h => h.hospitalId !== HOSPITAL_ID),
        ];
    }, [hospitals, HOSPITAL_ID, HOSPITAL_NAME]);

    console.log('HOSPITAL_NAME', HOSPITAL_NAME)
    
    return (
        <>
            <Header 
                backButtonVisible
                title="Location"
            />

            <View className="pt-10 flex-1 bg-background">
                <Content>
                    <View className="mb-3">
                        <Text variant={disableCountry ? 'labelDisabled' : 'label'}>{COUNTRY}</Text>
                        <Controller 
                            control={control}
                            name="COUNTRY_ISO"
                            rules={{ required: true, }}
                            render={({ field: { value, onChange }, }) => {
                                return (
                                    <>
                                        <Dropdown
                                            selected={value}
                                            onSelect={value => {
                                                onChange(value);
                                                setValue('COUNTRY_NAME', CONFIG.sites.filter(c => c.countryISO === value)[0]?.countryName || '');
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
                            name="HOSPITAL_ID"
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
                                                setValue('HOSPITAL_NAME', hospitalsOptions
                                                    .filter(h => h.hospitalId === value)[0]?.name || '');
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
                            {SAVE_CHANGES}
                        </Button>
                    </View>
                </Content>
            </View>
        </>
    );
}
