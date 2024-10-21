import { useEffect } from "react";
import { router } from "expo-router";
import { SafeAreaView, FlatList, TouchableOpacity } from "react-native";

import { useScripts } from "@/hooks/use-scripts";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Content } from "@/components/content";
import ucFirst from "@/lib/ucFirst";
import { Header } from "@/components/header/index";
import { useAsyncStorage } from "@/hooks/use-async-storage";

export default function HomeScreen() {
    const { list, listLoading, listInitialised, getList, } = useScripts();
    const { DEVICE_HASH, WEBEDITOR_DATA_VERSION } = useAsyncStorage();

    useEffect(() => { getList(); }, [getList]);

    if (!listInitialised) return null;

    return (
        <>
            <Header 
                menuButtonVisible
                title="Scripts"
                subtitle={`v${WEBEDITOR_DATA_VERSION} (${DEVICE_HASH})`}
            />

            <SafeAreaView>
                <FlatList 
                    data={list}
                    keyExtractor={item => item.scriptId}
                    refreshing={listLoading}
                    onRefresh={getList}
                    style={{ paddingTop: 20, }}
                    renderItem={({ item }) => {
                        return (
                            <TouchableOpacity
                                onPress={() => router.push({
                                    pathname: '/script/[scriptId]',
                                    params: { 
                                        scriptId: item.scriptId,
                                        title: item.title, 
                                        subtitle: ucFirst(item.type),
                                    },
                                })}
                            >
                                <Content>
                                    <Card className="mb-2">
                                        <CardContent>
                                            <CardTitle>{item.title}</CardTitle>
                                            
                                            {!!item.description && (
                                                <Text
                                                    className="text-gray-400"
                                                >{item.description}</Text>
                                            )}
                                        </CardContent>
                                    </Card>
                                </Content>
                            </TouchableOpacity>
                        )
                    }}
                />
            </SafeAreaView>
        </>
    );
}
