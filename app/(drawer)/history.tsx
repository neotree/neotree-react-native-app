import { useCallback } from "react";
import { useFocusEffect } from "expo-router";
import { SafeAreaView, FlatList, TouchableOpacity, View } from "react-native";

import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Content } from "@/components/content";
import ucFirst from "@/lib/ucFirst";
import { Header } from "@/components/header";
import { useAsyncStorage } from "@/hooks/use-async-storage";
import { useSessions } from "@/hooks/use-sessions";

export default function HistoryScreen() {
    const { list, listLoading, listInitialised, getList, } = useSessions();
    const { LAST_REMOTE_SYNC_DATE } = useAsyncStorage();

    useFocusEffect(useCallback(() => { getList(); }, [getList, LAST_REMOTE_SYNC_DATE]));

    return (
        <>
            <Header 
                backButtonVisible
                title="Sessions history"
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
                                        <Text className="text-center opacity-50">No sessions found</Text>
                                    </CardContent>
                                </Card>
                            </Content>
                        </>
                    ) : undefined}
                    renderItem={({ item }) => {
                        return (
                            <TouchableOpacity
                                onPress={() => {

                                }}
                            >
                                <Content>
                                    <Card className="mb-2">
                                        <CardContent>
                                            <CardTitle>{item.title}</CardTitle>
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
