import React, { useEffect, useState } from 'react';

import { Box, Br, Card, Text, Radio } from '../../../../components';
import { useContext } from '../../Context';
import * as types from '../../../../types';

type TypeFluidsProps = types.ScreenTypeProps & {
    
};

export function TypeFluids({ entry }: TypeFluidsProps) {    
    const {
        activeScreen,
        setEntryValues
    } = useContext();

    const metadata = activeScreen?.data?.metadata;
    const printable = activeScreen?.data?.printable !== false;

    const fluids = (metadata.fluids || []) as types.DrugsLibraryItem[];

    const [entryUpdated, setEntryUpdated] = useState(true);
    const [values, setValues] = useState(
        fluids
            .map(item => ({
                value: item.key,
                valueText: `${item.drug}`,
                label: item.drug,
                key: item.key,
                dataType: 'fluid',
                exclusive: false,
                confidential: false,
                exportType: 'fluid',
                data: item,
                printable,
                selected: false,
                extraLabels: [
                    `Hourly volume: ${item.hourlyDosage} ${item.drugUnit} every ${item.hourlyFeed} hours`,
                    `Administration frequency: ${item.administrationFrequency}`,
                    `Route of Administration: ${item.routeOfAdministration}`,
                    `${item.managementText}`,
                    `${item.dosageText}`,
                ],
            }))
    );

    const onSelect = React.useCallback((key: string, isSelected: boolean) => {
        setValues(prev => {
            return prev.map(v => {
                if (v.key !== key) return v;
                return { ...v, selected: isSelected, };
            });
        });
        setTimeout(() => setEntryUpdated(false), 0);
    }, []);

    useEffect(() => {
        if (!entryUpdated) {
            setEntryUpdated(true);
            setEntryValues(values);
        }
    }, [entryUpdated, values, setEntryValues]);

    console.log((entry?.values || []).map(e => e.selected));

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
                                            onChange={() => onSelect(d.key, true)}
                                            disabled={false}
                                        />
                                    </Box>
    
                                    <Box paddingLeft="xl">
                                        <Radio
                                            label="No"
                                            checked={!isSelected}
                                            onChange={() => onSelect(d.key, false)}
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
