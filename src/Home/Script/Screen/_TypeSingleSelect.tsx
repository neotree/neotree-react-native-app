import React, { useRef } from 'react';
import { TouchableOpacity } from 'react-native';

import { useScriptContext } from '@/src/contexts/script';
import { Box, Br, Card, Text } from '../../../components';
import * as types from '../../../types';

type TypeSingleSelectProps = types.ScreenTypeProps & {
    
};

export function TypeSingleSelect({}: TypeSingleSelectProps) {
    const autoFilled = useRef(false);
    
    const {
        activeScreen,
        mountedScreens,
        getPrepopulationData,
        setEntryValues,
        activeScreenEntry
    }= useScriptContext();
    const metadata = activeScreen?.data?.metadata;
    const printable = activeScreen.data.printable !== false;
    const canAutoFill = !mountedScreens[activeScreen?.id];

    const opts: any[] = metadata.items.map((item: any) => {
        let matched = undefined;
        if ((getPrepopulationData()[metadata.key]?.values?.value || [])[0] === item.id) {
            matched = getPrepopulationData()[metadata.key];
        }

        return {
            ...item,
            matched,
            onChange: () => {
                setValue(item.id);
                setEntryValues([{
                    printable,
                    value: item.id,
                    valueText: item.label,
                    // exportValue: item.label,
                    label: metadata.label,
                    valueLabel: item.label,
                    exportLabel: item.label,
                    key: metadata.key,
                    type: item.type,
                    dataType: metadata.dataType,
                    confidential: item.confidential,
                    exportType: 'single_select',
                }]);
            },
        };
    });

    const [value, setValue] = React.useState<string | number | null>(activeScreenEntry?.values[0]?.value);

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
