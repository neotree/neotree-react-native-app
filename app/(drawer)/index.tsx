import { useCallback } from "react";
import { router, useFocusEffect } from "expo-router";
import { SafeAreaView, FlatList, TouchableOpacity, View } from "react-native";

import { useScripts } from "@/hooks/use-scripts";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Content } from "@/components/content";
import ucFirst from "@/lib/ucFirst";
import { Header } from "@/components/header";
import { useAsyncStorage } from "@/hooks/use-async-storage";

export default function HomeScreen() {
    const { list, listLoading, listInitialised, getList, } = useScripts();
    const { DEVICE_HASH, WEBEDITOR_DATA_VERSION, LAST_REMOTE_SYNC_DATE } = useAsyncStorage();

    useFocusEffect(useCallback(() => { getList(); }, [getList, LAST_REMOTE_SYNC_DATE]));

    return (
        <>
            <Header 
                menuButtonVisible
                title="Scripts"
                subtitle={`v${WEBEDITOR_DATA_VERSION} (${DEVICE_HASH})`}
            />

            <SafeAreaView className="flex-1">
                <FlatList 
                    data={list}
                    keyExtractor={item => item.scriptId}
                    refreshing={listLoading}
                    onRefresh={getList}
                    style={{ paddingTop: 20, }}
                    ListFooterComponent={() => <View className="my-20" />}
                    ListEmptyComponent={(listInitialised && !listLoading) ? (
                        <>
                            <Content>
                                <Card>
                                    <CardContent>
                                        <Text className="text-center opacity-50">No scripts found</Text>
                                    </CardContent>
                                </Card>
                            </Content>
                        </>
                    ) : undefined}
                    renderItem={({ item }) => {
                        return (
                            <TouchableOpacity
                                onPress={() => router.push({
                                    pathname: '/script/[scriptId]',
                                    params: { 
                                        scriptId: item.scriptId,
                                        scriptTitle: item.title, 
                                        scriptSubtitle: ucFirst(item.type),
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
