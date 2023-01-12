import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Box, Br, Card, Text } from '../../../components';
import { useContext } from '../Context';
import * as types from '../../../types';

type TypeYesNoProps = types.ScreenTypeProps & {
    
};

export function TypeYesNo({}: TypeYesNoProps) {
    const ctx = useContext();

    const metadata = ctx?.activeScreen?.data?.metadata;
    const canAutoFill = !ctx?.mountedScreens[ctx?.activeScreen?.id];

    const _opts = [
        { value: 'true', label: metadata?.positiveLabel || 'Yes' },
        { value: 'false', label: metadata?.negativeLabel || 'No' },
    ];

    const opts = _opts.map(o => ({
        ...o,
        matched: (ctx?.matched?.autoFill?.session?.data?.entries || {})[metadata.key],
        onChange: () => {
            const value = o.value;
            setValue(o.value);
            ctx?.setEntryValues([{
                value,
                confidential: metadata.confidential,
                valueText: value === 'false' ? 'No' : 'Yes',
                key: metadata.key,
                label: o.label,
                type: metadata.dataType,
                dataType: metadata.dataType,
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
                const isSelected = `${o.value}` === `${value}`;

                return (
                    <React.Fragment key={o.value}>
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
