import React from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Box, Button, Card, Content, TextInput } from '../../components';
import * as types from '../../types';

type StartProps = {
    script: types.Script | null;
    screens: types.Screen[];
    navigation: NativeStackNavigationProp<types.HomeRoutes, "Script", undefined>
};

export function Start({ script, navigation, screens }: StartProps) {
    return (
        <Box flex={1}>
            <Box flex={1}>
                <Content>
                    <TextInput
                        placeholder="Search existing NUID"
                        size="l"
                    />
                </Content>
            </Box>

            <Box alignContent="center" justifyContent="center">
                <Content>
                    <Button
                        size="l"
                        disabled={!screens.length}
                        onPress={() => {
                            navigation.navigate('Script', {
                                script_id: script.script_id,
                                screen_id: screens[0]?.screen_id,
                            });
                        }}
                    >Start</Button>
                </Content>
            </Box>
        </Box>
    );
}
