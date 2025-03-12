import React, { useEffect, useRef, useState } from 'react';

import { Box, Br, Card, Text, Radio } from '../../../../components';
import { useContext } from '../../Context';
import * as types from '../../../../types';

type TypeFluidsProps = types.ScreenTypeProps & {
    
};

export function TypeFluids({ entry }: TypeFluidsProps) {    
    const mounted = useRef(false);
    const {
        activeScreen,
        setEntryValues
    } = useContext();

    const metadata = activeScreen?.data?.metadata;
    const printable = activeScreen?.data?.printable !== false;

    const fluids = (metadata.fluids || []) as types.DrugsLibraryItem[];

    const [entryUpdated, setEntryUpdated] = useState(true);
    const [values, setValues] = useState<types.ScreenEntryValue[]>(entry?.values || []);

    const onSelect = React.useCallback((fluid: types.DrugsLibraryItem, isSelected: boolean) => {
        setValues(prev => {
            if (isSelected) {
                return [
                    ...prev.filter(v => v.key !== fluid.key),
                    {
                        value: fluid.key,
                        valueText: `${fluid.drug}`,
                        label: fluid.drug,
                        key: fluid.key,
                        dataType: 'fluid',
                        exclusive: false,
                        confidential: false,
                        exportType: 'fluid',
                        data: fluid,
                        printable,
                        selected: true,
                        extraLabels: [
                            `Hourly volume: ${fluid.hourlyDosage} ${fluid.drugUnit} every ${fluid.hourlyFeed} hours`,
                            `Administration frequency: ${fluid.administrationFrequency}`,
                            `Route of Administration: ${fluid.routeOfAdministration}`,
                            `${fluid.managementText}`,
                            `${fluid.dosageText}`,
                        ],
                    },
                ];
            } else {
                return prev.filter(v => v.key !== fluid.key);
            }
        });
        setTimeout(() => setEntryUpdated(false), 0);
    }, []);

    useEffect(() => {
        if (!entryUpdated) {
            setEntryUpdated(true);
            setEntryValues(values);
        }
    }, [entryUpdated, values, setEntryValues]);

    useEffect(() => {
        if (!mounted.current) setEntryValues([]);
        mounted.current = true;
    }, [setEntryValues]);

    return (
        <Box>
            {fluids.map(d => {
                const isSelected = values.filter(v => v.key === d.key)[0]?.selected === true;

                return (
                    <React.Fragment key={d.key}>
                        <Card>
                            <Text
                                variant="title3"
                            >{d.drug}</Text>

                            <Text
                                color="textSecondary"
                                mt="s"
                            >Hourly volume: {`${d.hourlyDosage} ${d.drugUnit} every ${d.hourlyFeed} hours`}</Text>

                            <Text
                                color="textSecondary"
                                mt="s"
                            >Administration frequency: {d.administrationFrequency}</Text>

                            <Text
                                color="textSecondary"
                                mt="s"
                            >Route of Administration: {d.routeOfAdministration}</Text>

                            <Text
                                color="textSecondary"
                                mt="s"
                            >{d.managementText}</Text>

                            <Text
                                color="textSecondary"
                                mt="s"
                            >{d.dosageText}</Text>

                            <Box mt="l">
                                <Text variant="title3">Would you like to administer this fluid?</Text>
    
                                <Br spacing='s'/>
    
                                <Box flexDirection="row" justifyContent="flex-end">
                                    <Box>
                                        <Radio
                                            label="Yes"
                                            checked={isSelected}
                                            onChange={() => onSelect(d, true)}
                                            disabled={false}
                                        />
                                    </Box>
    
                                    <Box paddingLeft="xl">
                                        <Radio
                                            label="No"
                                            checked={!isSelected}
                                            onChange={() => onSelect(d, false)}
                                            disabled={false}
                                        />
                                    </Box>
                                </Box>
                            </Box>
                        </Card>

                        <Br spacing="l" />
                    </React.Fragment>
                );
            })}
        </Box>
    );
}
