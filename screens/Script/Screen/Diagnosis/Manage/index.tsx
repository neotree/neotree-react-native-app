import React from 'react';
import { ScrollView } from 'react-native';
import { View, Content } from '@/components/ui';
import { ScreenDiagnosisComponentProps } from '../../../types';
import { Fab } from '../../Fab';

export function Manage(props: ScreenDiagnosisComponentProps) {
    return (
        <>
            <View style={{ flex: 1 }}>
                <ScrollView>
                    <Content>

                    </Content>
                </ScrollView>
            </View>
            <Fab onPress={() => {}} />
        </>
    );
}
