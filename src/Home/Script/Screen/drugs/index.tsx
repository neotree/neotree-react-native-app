import React, { useEffect, useRef, useState } from 'react';

import { Box, Br, Card, Text, Radio } from '@/src/components';
import * as types from '@/src/types';
import { useContext } from '../../Context';

type TypeDrugsProps = types.ScreenTypeProps & {
    
};

export function TypeDrugs({ entry }: TypeDrugsProps) {   
    const mounted = useRef(false);

    const {
        activeScreen,
        activeScreenEntry,
        setEntryValues
    } = useContext();

    const metadata = activeScreen?.data?.metadata;
    const printable = activeScreen?.data?.printable !== false;

    const drugs = (metadata.drugs || []) as types.DrugsLibraryItem[];

    let cachedVal = (activeScreenEntry?.values || [])[0]?.value || [];
	if (cachedVal && !cachedVal.map) cachedVal = [cachedVal];

    const [entryUpdated, setEntryUpdated] = useState(true);
    const [values, setValues] = useState<types.ScreenEntryValue[]>(entry?.values || []);

    const onSelect = React.useCallback((drug: types.DrugsLibraryItem, isSelected: boolean) => {
        setValues(prev => {
            if (isSelected) {
                return [
                    ...prev.filter(v => v.key !== drug.key),
                    {
                        value: drug.key,
                        valueText: `${drug.drug}`,
                        label: drug.drug,
                        key: drug.key,
                        dataType: 'drug',
                        exclusive: false,
                        confidential: false,
                        exportType: 'drug',
                        data: drug,
                        printable,
                        selected: true,
                        extraLabels: [
                            `Dosage: ${drug.dosage} ${drug.drugUnit}`,
                            `Administration frequency: ${drug.administrationFrequency}`,
                            `Route of Administration: ${drug.routeOfAdministration}`,
                            `${drug.managementText}`,
                            `${drug.dosageText}`,
                        ],
                    },
                ];
            } else {
                return prev.filter(v => v.key !== drug.key);
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
            {drugs.map(d => {
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
                            >Dosage: {`${d.dosage} ${d.drugUnit}`}</Text>

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
                                <Text variant="title3">Would you like to administer this drug?</Text>
    
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
