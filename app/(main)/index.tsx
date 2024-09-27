import { SafeAreaView, FlatList, TouchableOpacity } from "react-native";
import { router } from "expo-router";

import { useScripts } from "@/hooks/use-scripts";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Content } from "@/components/content";

export default function HomeScreen() {
    const { scripts, loading, getScripts, } = useScripts();

    return (
        <>
            <SafeAreaView className="pt-5">
                <FlatList 
                    data={scripts.data}
                    keyExtractor={item => item.scriptId}
                    refreshing={loading}
                    onRefresh={getScripts}
                    renderItem={({ item }) => {
                        return (
                            <TouchableOpacity
                                onPress={() => router.push(`/script/${item.scriptId}`)}
                                onLongPress={() => {
                                    alert(10);
                                }}
                            >
                                <Content>
                                    <Card className="mb-[10px]">
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
