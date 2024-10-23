import { useCallback, useEffect, useState } from "react";
import { SafeAreaView, FlatList, TouchableOpacity, Switch, View } from "react-native";

import { useConfigKeys } from "@/hooks/use-config-keys";
import { Content } from "@/components/content";
import { Header } from "@/components/header/index";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";
import { useTheme } from "@/hooks/use-theme";
import { useConfiguration } from "@/hooks/use-configuration";
import { Card, CardContent } from "@/components/ui/card";

export default function ConfigurationScreen() {
    const theme = useTheme();
    const { list, listLoading, listInitialised, getList, } = useConfigKeys();
    const { configuration, saveConfiguration, getConfiguration } = useConfiguration();

    useEffect(() => { 
        getList(); 
        getConfiguration();
    }, [getList, getConfiguration]);

    const generateForm = useCallback(() => list.reduce((acc, c) => ({
        ...acc,
        [c.key]: false,
        ...configuration,
    }), {} as { [key: string]: boolean; }), [list, configuration]);

    const [form, setForm] = useState(generateForm());

    useEffect(() => { setForm(generateForm()); }, [generateForm]);

    const toggleValue = useCallback((key: string) => {
        setForm(prev => ({
            ...prev,
            [key]: !prev[key],
        }));
        saveConfiguration([{ key, selected: configuration[key] ? 0 : 1, }]);
    }, [configuration, saveConfiguration]);

    if (!listInitialised) return null;

    return (
        <>
            <Header 
                backButtonVisible
                title="Configuration"
            />

            <SafeAreaView className="bg-background flex-1">
                <FlatList 
                    data={list}
                    keyExtractor={item => item.configKeyId}
                    refreshing={listLoading}
                    onRefresh={getList}
                    style={{ paddingTop: 20, }}
                    ListEmptyComponent={(listInitialised && !listLoading) ? (
                        <>
                            <Content>
                                <Card>
                                    <CardContent>
                                        <Text className="text-center opacity-50">No config keys found</Text>
                                    </CardContent>
                                </Card>
                            </Content>
                        </>
                    ) : undefined}
                    renderItem={({ item }) => {
                        const selected = form[item.key];

                        return (
                            <>
                                <TouchableOpacity
                                    className="px-4 py-2"
                                    onPress={() => {
                                        toggleValue(item.key);
                                    }}
                                >
                                    <Content className="flex-row items-center">
                                        <Text className="text-lg flex-1 mr-2">{item.label}</Text>

                                        <View>
                                            <Switch 
                                                value={selected}
                                                trackColor={!selected ? undefined : { true: theme.primaryColor500, false: theme.primaryColor500, }}
                                                thumbColor={!selected ? undefined : theme.primaryColor}
                                                ios_backgroundColor={!selected ? undefined : theme.primaryColor}
                                                onChange={() => toggleValue(item.key)}
                                            />
                                        </View>
                                    </Content>
                                </TouchableOpacity>
                                <Content>
                                    <Separator />
                                </Content>
                            </>
                        )
                    }}
                />
            </SafeAreaView>
        </>
    );
}

