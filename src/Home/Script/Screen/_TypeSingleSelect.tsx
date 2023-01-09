import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Box, Br, Card, Text } from '../../../components';
import { useContext } from '../Context';
import * as types from '../../../types';

type TypeSingleSelectProps = types.ScreenTypeProps & {
    
};

export function TypeSingleSelect({}: TypeSingleSelectProps) {
    const ctx = useContext();
    const metadata = ctx?.activeScreen?.data?.metadata;
    const opts: any[] = metadata.items;

    const [value, setValue] = React.useState<string | number | null>(ctx?.activeScreenEntry?.values[0]?.value);

    return (
        <Box>
            {opts.map(o => {
                const isSelected = `${o.id}` === `${value}`;

                return (
                    <React.Fragment key={o.id}>
                        <TouchableOpacity 
                            onPress={() => {
                                setValue(o.id);
                                ctx?.setEntryValues([{
                                    value: o.id,
                                    valueText: o.label,
                                    label: o.label,
                                    key: metadata.key,
                                    type: o.type,
                                    dataType: metadata.dataType,
                                    confidential: o.confidential,
                                }]);
                            }}
                        >
                            <Card backgroundColor={isSelected ? 'primary' : undefined}>
                                <Text
                                    color={isSelected ? 'primaryContrastText' : undefined}
                                    textAlign="center"
                                    variant="title3"
                                >{o.label}</Text>
                            </Card>
                        </TouchableOpacity>

                        <Br spacing="l" />
                    </React.Fragment>
                )
            })}
        </Box>
    );
}
