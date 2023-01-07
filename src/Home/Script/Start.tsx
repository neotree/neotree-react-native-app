import React from 'react';
import { Box, Button, Content, NeotreeIDInput } from '../../components';
import { useContext } from './Context';

export function Start() {
    const ctx = useContext();

    const [uid, setUID] = React.useState('');

    return (
        <Box flex={1} paddingTop="xl">
            <Box flex={1}>
                <Content>
                    <NeotreeIDInput
                        label="Search existing NUID"
                        onChange={uid => setUID(uid)}
                        value={uid}
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
