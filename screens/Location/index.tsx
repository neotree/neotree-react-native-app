import React from 'react';
import { ScrollView, SafeAreaView } from 'react-native';
import { Logo } from '@/components/Logo';
import { Content, useTheme, View, Text, Br } from '@/components/ui';
import * as copy from '@/constants/copy/locationScreen';
import Form from './Form';
import { useAppContext } from '@/AppContext';

export * from './InitialLocationSetup';

export function LocationScreen() {
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
                <Content>
                    <Text style={{ textAlign: 'center' }} variant="h5">{copy.SCREEN_TITLE}</Text>
                    <Br />
                    <Form onSetLocation={refreshApp} />
                </Content>
            </ScrollView>
        </SafeAreaView>
    );
};