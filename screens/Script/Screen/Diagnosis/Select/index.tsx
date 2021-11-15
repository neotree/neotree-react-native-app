import React from 'react';
import { TouchableOpacity, ScrollView } from 'react-native';
import { useTheme, View, Text, Br, Content } from '@/components/ui';
import { useScriptContext } from '../../../Context';
import { ScreenDiagnosisComponentProps } from '../../../types';
import { Fab } from '../../Fab';

export function Select({ value, onDiagnosisChange, setSection }: ScreenDiagnosisComponentProps) {
    const theme = useTheme();
    const { activeScreen } = useScriptContext();
    const items = activeScreen.data.metadata?.items || [];
    const exclusiveIsSelected = items
        .filter(item => item.exclusive)
        .filter(item => value.values.map(v => v?.diagnosis?.name).includes(item.label))[0];

    return (
        <View style={{ flex: 1 }}>
            <ScrollView>
                <Content>
                    {items.map((item, i) => {
                        const isExclusive = item.exclusive;
                        const isSelected = !!value.values.filter(v => v?.diagnosis?.name === item.label)[0];
                        const disabled = exclusiveIsSelected && !isExclusive;

                        return (
                            <React.Fragment key={i}>
                                <View
                                    variant="elevated"
                                    style={[
                                        !isSelected ? {} : { backgroundColor: theme.palette.primary.main },
                                        !disabled ? {} : { backgroundColor: theme.palette.action.disabledBackground },
                                    ]}
                                >
                                    <TouchableOpacity
                                        style={[
                                            { padding: theme.spacing() },
                                        ]}
                                        disabled={disabled}
                                        onPress={() => {
                                            if (exclusiveIsSelected && !isExclusive) return;
                                            onDiagnosisChange({ 
                                                name: item.label,
                                                how_agree: 'Yes',
                                            });
                                        }}
                                    >
                                        <Text
                                            style={[
                                                { textAlign: 'center' },
                                                !isSelected ? {} : { color: theme.palette.primary.contrastText },
                                                !disabled ? {} : { color: theme.palette.action.disabled },
                                            ]}
                                        >{item.label}</Text>
                                    </TouchableOpacity>
                                </View>
                                <Br />
                            </React.Fragment>
                        )
                    })}
                </Content>
            </ScrollView>
            <Fab onPress={() => setSection('agree_disagree')} />
        </View>
    );
}
