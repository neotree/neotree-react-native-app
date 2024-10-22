import { useCallback, useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";

import { useAlertModal } from "@/hooks/use-alert-modal";
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
import { Splash } from "@/components/splash";
import { Loader } from "@/components/loader";
import { WifiOff } from "@/components/svgs/wifi-off";

export default function LocationScreen() {
    const [loading, setLoading] = useState(false);
    const { remoteSyncing, sync } = useSyncRemoteData();
    const { COUNTRY_ISO, COUNTRY_NAME, HOSPITAL_ID, HOSPITAL_NAME, itemsUpdating, setItems } = useAsyncStorage();
    const { hospitals, loadHospitalsErrors, hospitalsLoading, getHospitals } = useHospitals();
    const { hasInternet } = useNetInfo();
    const { alert } = useAlertModal();

    useEffect(() => { if (hasInternet) getHospitals(); }, [hasInternet, getHospitals]);

    const [configuredValues, setConfiguredValues] = useState({
        COUNTRY_ISO, 
        COUNTRY_NAME, 
        HOSPITAL_ID, 
        HOSPITAL_NAME,
    });

    const [form, setForm] = useState(configuredValues);

    const isDirty = useMemo(() => (
        (form.COUNTRY_ISO !== COUNTRY_ISO) || 
        ((form.HOSPITAL_ID !== HOSPITAL_ID))
    ), [form.COUNTRY_ISO, form.HOSPITAL_ID, COUNTRY_ISO, HOSPITAL_ID]);

    const submit = useCallback(async () => {
        try {
            setLoading(true);

            await setItems({ ...form });
            await sync({ force: true, clearData: true, });

            setConfiguredValues(form);

            alert({
                message: 'Location was successfully changed!',
                variant: 'success',
            });

            router.push('/(drawer)');
        } catch(e: any) {
            try { await setItems({ ...configuredValues }); } catch(e) { /**/ }
            alert({
                title: 'Change location',
                message: 'Failed to change location',
                variant: 'error',
            });
        } finally {
            setLoading(false);
        }
    }, [form, configuredValues, router.push, setItems, alert, sync]);

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

    const canSubmit = useMemo(() => !loading && !!(COUNTRY_ISO && HOSPITAL_ID && hasInternet), [
        loading,
        COUNTRY_ISO, 
        HOSPITAL_ID,
        hasInternet,
    ]);

    const hospitalsOptions = useMemo(() => {
        return [
            { name: HOSPITAL_NAME, hospitalId: HOSPITAL_ID, },
            ...hospitals
                .map(o => ({ ...o, hospitalId: o.oldHospitalId || o.hospitalId, }))
                .filter(h => h.hospitalId !== HOSPITAL_ID),
        ];
    }, [hospitals, HOSPITAL_ID, HOSPITAL_NAME]);
    
    return (
        <>
            <Header 
                backButtonVisible
                title="Location"
            />

            {(loading || remoteSyncing) && (
                <Splash>
                    <Loader className="mb-2" />
                    <Text className="text-xs">Applying changes, please wait...</Text>
                </Splash>
            )}

            <View className="pt-10 flex-1 bg-background">
                <Content>
                    <View className="mb-3">
                        <Text variant={disableCountry ? 'labelDisabled' : 'label'}>{COUNTRY}</Text>
                        <Dropdown
                            selected={form.COUNTRY_ISO}
                            onSelect={value => {
                                setForm(prev => ({
                                    ...prev,
                                    COUNTRY_ISO: `${value || COUNTRY_ISO}`,
                                    COUNTRY_NAME: CONFIG.sites.filter(c => c.countryISO === value)[0]?.countryName || COUNTRY_NAME,
                                }));
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
                    </View>

                    <View className="mb-3">
                        <Text 
                            variant={disableHospitals ? 'labelDisabled' : 'label'}
                        >{HOSPITAL}</Text>
                        <Dropdown
                            searchable
                            searchPlaceholder="Search hospitals"
                            selected={form.HOSPITAL_ID}
                            onSelect={value => {
                                setForm(prev => ({
                                    ...prev,
                                    HOSPITAL_ID: `${value || HOSPITAL_ID}`,
                                    HOSPITAL_NAME: hospitalsOptions.filter(h => h.hospitalId === value)[0]?.name || HOSPITAL_NAME,
                                }));
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
                        {!!loadHospitalsErrors?.length && <Text className="text-xs text-danger mt-1">{loadHospitalsErrors.join(', ')}</Text>}
                    </View>

                    <View>
                        <Button
                            onPress={submit}
                            disabled={!canSubmit || !isDirty}
                        >
                            {SAVE_CHANGES}
                        </Button>
                    </View>

                    {!hasInternet && (
                        <View className="my-10 items-center justify-center">
                            <WifiOff svgClassName="stroke-danger opacity-50 mb-2" />
                            <Text className="text-danger text-sm">No internet</Text>
                        </View>
                    )}
                </Content>
            </View>
        </>
    );
}
