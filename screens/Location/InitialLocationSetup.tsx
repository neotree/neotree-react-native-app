import React from 'react';
import { ScrollView, SafeAreaView } from 'react-native';
import { Logo } from '@/components/Logo';
import { Content, useTheme, View, Text, Br } from '@/components/ui';
import * as copy from '@/constants/copy/locationScreen';
import Form from './Form';
import { useAppContext } from '@/AppContext';

export function InitialLocationSetupScreen() {
    const { refreshApp } = useAppContext();
    const theme = useTheme();

    return (
        <SafeAreaView style={{ flex: 1, }}>
            <ScrollView
                contentContainerStyle={{
                    flex: 1,
                    justifyContent: 'center',
                    marginVertical: theme.spacing(2),
                    backgroundColor: theme.palette.background.paper,
                }}
            >
                <Content variant="outlined">
                    <View style={{ alignItems: 'center' }}>
                        <Logo size="large" />
                        <Br />
                        <Text variant="h5">{copy.SCREEN_TITLE}</Text>
                    </View>

                    <Br /><Br /><Br />

                    <Form onSetLocation={refreshApp} />
                </Content>
            </ScrollView>
        </SafeAreaView>
    );
};
