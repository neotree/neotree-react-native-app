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
    const canAutoFill = !ctx?.mountedScreens[ctx?.activeScreen?.id];

    const opts: any[] = metadata.items.map((item: any) => ({
        ...item,
        matched: (ctx?.matched?.autoFill?.session?.data?.entries || {})[metadata.key],
        onChange: () => {
            setValue(item.id);
            ctx?.setEntryValues([{
                value: item.id,
                valueText: item.label,
                label: item.label,
                key: metadata.key,
                type: item.type,
                dataType: metadata.dataType,
                confidential: item.confidential,
            }]);
        },
    }));

    const [value, setValue] = React.useState<string | number | null>(ctx?.activeScreenEntry?.values[0]?.value);

    React.useEffect(() => {
        if (canAutoFill) {
            const o = opts.filter(o => o.matched)[0];
            if (o) o.onChange();
        }
    }, [canAutoFill, opts]);

    return (
        <Box>
            {opts.map(o => {
                const isSelected = `${o.id}` === `${value}`;

                return (
                    <React.Fragment key={o.id}>
                        <TouchableOpacity 
                            onPress={() => o.onChange()}
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
