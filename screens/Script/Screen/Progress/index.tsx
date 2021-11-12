import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { Br, Text, useTheme, View } from '@/components/ui';
import { useScriptContext } from '../../Context';
import { ScreenComponentProps } from '../../types';

export function Progress({ setEntry }: ScreenComponentProps) {
    const theme = useTheme();
    const { activeScreen } = useScriptContext();
    const metadata = { ...activeScreen.data.metadata };

    React.useEffect(() => { setEntry({ values: [] }); }, []);

    const items = metadata.items || [];

    return (
        <>
            {items.map((item, i) => {
                const color = item.checked ? 'green' : '#999';
                return (
                    <View
                        key={i}
                        style={{ flexDirection: 'row', }}
                    >
                        <View
                            style={{
                                marginRight: 10,
                                alignItems: 'center',
                            }}
                        >
                            <View
                                style={{
                                width: 36,
                                height: 36,
                                borderWidth: 2,
                                borderColor: color,
                                borderRadius: 18,
                                alignItems: 'center',
                                justifyContent: 'center',
                                }}
                            >
                                <MaterialIcons
                                    size={24}
                                    color="black"
                                    style={{
                                        fontSize: 30,
                                        color: color
                                    }}
                                    name="check"
                                />
                            </View>
        
                            {i < (items.length - 1) && (
                                <View
                                    style={{
                                        width: 2,
                                        minHeight: 20,
                                        backgroundColor: '#ccc',
                                        flex: 1,
                                    }}
                                />
                            )}
                            </View>
            
                            <View style={{ flex: 1, marginTop: 2 }}>
                            <Text style={{ fontSize: 22 }}>{item.label}</Text>
                        </View>
                    </View>
                );
            })}
        </>
    );
}
