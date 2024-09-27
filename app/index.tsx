import { SafeAreaView, FlatList } from "react-native";

import { useScripts } from "@/hooks/use-scripts";
import { Card, CardTitle } from "@/components/ui/card";
import { Text } from "@/components/ui/text";

export default function HomeScreen() {
    const { scripts } = useScripts();

    return (
        <>
            <SafeAreaView>
                <FlatList 
                    data={scripts.data}
                    keyExtractor={item => item.scriptId}
                    renderItem={({ item }) => {
                        return (
                            <Card>
                                <CardTitle>{item.title}</CardTitle>
                                {!!item.description && <Text>{item.description}</Text>}
                            </Card>
                        )
                    }}
                />
            </SafeAreaView>
        </>
    );
}
