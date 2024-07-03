import React, { useRef } from 'react';
import { TouchableOpacity } from 'react-native';
import { Box, Br, Card, Text } from '../../../components';
import { useContext } from '../Context';
import * as types from '../../../types';

type TypeYesNoProps = types.ScreenTypeProps & {
    
};

export function TypeYesNo({}: TypeYesNoProps) {
    const autoFilled = useRef(false);
    
    const ctx = useContext();

    const metadata = ctx.activeScreen.data.metadata;
    const canAutoFill = !ctx.mountedScreens[ctx.activeScreen?.id];
    const printable = ctx.activeScreen.data.printable !== false;

    const _opts = [
        { value: 'true', label: metadata?.positiveLabel || 'Yes' },
        { value: 'false', label: metadata?.negativeLabel || 'No' },
    ];

    const opts = _opts.map(o => {
        let matched = undefined;
        if (((ctx.getPrepopulationData()[metadata.key]?.values?.value || [])[0] === 'Yes') && (o.value === 'true')) {
            matched = ctx.getPrepopulationData()[metadata.key];
        } else if (((ctx.getPrepopulationData()[metadata.key]?.values?.value || [])[0] === 'No') && (o.value === 'false')) {
            matched = ctx.getPrepopulationData()[metadata.key];
        }
        return {
            ...o,
            matched,
            onChange: () => {
                const value = o.value;
                setValue(o.value);
                ctx.setEntryValues([{
                    value,
                    printable,
                    confidential: metadata.confidential,
                    valueText: value === 'false' ? 'No' : 'Yes',
                    exportValue: value === 'false' ? 'No' : 'Yes',
                    valueLabel: metadata.label,
                    key: metadata.key,
                    label: o.label,
                    type: metadata.dataType,
                    dataType: metadata.dataType,
                    exportType: 'yesno',
                }]);
            },
        };
    });

    const [value, setValue] = React.useState<string | number | null>(ctx.activeScreenEntry?.values[0]?.value);

    React.useEffect(() => {
        if (canAutoFill && !autoFilled.current) {
            const o = opts.filter(o => o.matched)[0];
            if (o) o.onChange();
            autoFilled.current = true;
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
