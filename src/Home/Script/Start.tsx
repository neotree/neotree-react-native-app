import React from 'react';
import { Box, Button, Content, TextInput } from '../../components';
import { useContext } from './Context';

export function Start() {
    const ctx = useContext();

    return (
        <Box flex={1} paddingTop="xl">
            <Box flex={1}>
                <Content>
                    <TextInput
                        placeholder="Search existing NUID"
                    />
                </Content>
            </Box>

            <Box alignContent="center" justifyContent="center">
                <Content>
                    <Button
                        disabled={!ctx?.screens?.length}
                        onPress={() => {
                            ctx?.navigation?.navigate('Script', {
                                script_id: ctx?.script?.script_id,
                                screen_id: ctx?.screens[0]?.screen_id,
                            });
                        }}
                    >Start</Button>
                </Content>
            </Box>
        </Box>
    );
}
