import React from 'react';
import { ScrollView, SafeAreaView, FlatList, TouchableOpacity } from 'react-native';
import { Text, Content, Br, View, useTheme } from '@/components/ui';
import { ScriptData, getScripts } from '@/api';
import { RootTabScreenProps } from '../../types/navigation';

export function HomeScreen({ navigation }: RootTabScreenProps<'Home'>) {
    const theme = useTheme();
    const [scripts, setScripts] = React.useState<ScriptData[]>([]);
    const [loadingScripts, setLoadingScripts] = React.useState(true);

    const loadScripts = React.useCallback(() => {
        (async () => {
            try {
                const scripts = await getScripts();
                setScripts(scripts);
            } catch (e) { /* DO NOTHING */ }
            setLoadingScripts(false);
        })();
    }, []);

    React.useEffect(() => { loadScripts(); }, []);

    return (
        <SafeAreaView>
            <FlatList
                refreshing={loadingScripts}
                onRefresh={loadScripts}
                ListHeaderComponent={Br}
                data={scripts}
                keyExtractor={item => item.script_id}
                renderItem={({ item }) => {
                    return (
                        <>
                            <TouchableOpacity 
                                onPress={() => navigation.navigate('Script', { script_id: item.script_id })}
                                style={{
                                    padding: theme.spacing(),
                                    borderColor: theme.palette.divider,
                                    borderWidth: 1,
                                    width: theme.layout.contentWidth,
                                    maxWidth: theme.layout.maxContentWidth,
                                    marginLeft: 'auto',
                                    marginRight: 'auto',
                                    borderRadius: 5
                                }}
                            >
                                <Text>{item.data.title}</Text>
                                {!!item.data.description && <Text color="disabled">{item.data.description}</Text>}
                            </TouchableOpacity>
                            <Br />
                        </>
                    )
                }}
            />
        </SafeAreaView>
    );
};
