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

    const opts: any[] = metadata.items.map((item: any) => ({
        label: item.label,
        value: item.id,
    }));

    const [value, setValue] = React.useState(null);

    return (
        <Box>
            {opts.map(o => {
                const isSelected = `${o.value}` === `${value}`;

                return (
                    <React.Fragment key={o.value}>
                        <TouchableOpacity onPress={() => setValue(o.value)}>
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
