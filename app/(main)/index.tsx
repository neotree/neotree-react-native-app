import { SafeAreaView, FlatList, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";

import { useScripts } from "@/hooks/use-scripts";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Content } from "@/components/content";
import { Modal, ModalContent, ModalTrigger } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { useConfirmModal } from "@/hooks/use-confirm-modal";
import { useAlertModal } from "@/hooks/use-alert-modal";

export default function HomeScreen() {
    const { scripts, loading, getScripts, } = useScripts();
    const { confirm } = useConfirmModal();
    const { alert } = useAlertModal();

    return (
        <>
            <SafeAreaView className="pt-5">
                <View className="flex-row gap-x-2">
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

                    <Button
                        onPress={() => confirm(() => {}, {
                            title: 'Delete item?',
                            message: 'Are you sure?',
                            danger: true,
                        })}
                    >
                        Confirm
                    </Button>

                    <Button
                        onPress={() => alert({
                            title: 'Item deleted',
                            message: 'Item was deleted succefully!',
                            variant: 'success',
                        })}
                    >
                        Alert
                    </Button>
                </View>

                <FlatList 
                    data={scripts.data}
                    keyExtractor={item => item.scriptId}
                    refreshing={loading}
                    onRefresh={getScripts}
                    renderItem={({ item }) => {
                        return (
                            <TouchableOpacity
                                onPress={() => router.push(`/script/${item.scriptId}`)}
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
