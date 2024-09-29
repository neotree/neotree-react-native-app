import { SafeAreaView, FlatList, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";

import { useScripts } from "@/hooks/use-scripts";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Content } from "@/components/content";
import { Modal, ModalClose, ModalContent, ModalTrigger } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

export default function HomeScreen() {
    const { scripts, loading, getScripts, } = useScripts();

    return (
        <>
            <SafeAreaView className="pt-5">
                <Modal 
                    closeOnClickAway={false}
                    title="Test this modal component"
                    actions={[
                        {
                            label: 'Cancel',
                            color: 'danger',
                            destructive: true,
                        },
                        {
                            label: 'Continue',
                        },
                    ]}
                >
                    <ModalTrigger as={Button}>
                        Open modal
                    </ModalTrigger>

                    <ModalContent>
                        <View>
                            <Text>This is a test!</Text>
                        </View>
                    </ModalContent>
                </Modal>

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
