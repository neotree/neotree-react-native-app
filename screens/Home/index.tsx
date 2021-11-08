import React from 'react';
import { ScrollView, SafeAreaView } from 'react-native';
import { Text, Content } from '@/components/ui';
import { Script, getScripts } from '@/api';
import { RootTabScreenProps } from '../../types/navigation';

export function HomeScreen({ navigation }: RootTabScreenProps<'Home'>) {
    const [scripts, setScripts] = React.useState<Script[]>([]);

    React.useEffect(() => {
        (async () => {
            try {
                const scripts = await getScripts();
                setScripts(scripts.map(s => s.data));
            } catch (e) { /* DO NOTHING */ }
        })();
    }, []);

    return (
        <SafeAreaView>
            <ScrollView>
                <Content>
                    
                </Content>
            </ScrollView>
        </SafeAreaView>
    );
};
