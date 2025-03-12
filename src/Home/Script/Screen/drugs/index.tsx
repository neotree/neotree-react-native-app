import React, { useEffect, useState } from 'react';

import { Box, Br, Card, Text, Radio } from '@/src/components';
import * as types from '@/src/types';
import { useContext } from '../../Context';

type TypeDrugsProps = types.ScreenTypeProps & {
    
};

export function TypeDrugs({ entry }: TypeDrugsProps) {    
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
    const [values, setValues] = useState(
        drugs
            .map(item => {
                const val = (entry?.values || []).filter(v => v.key === item.key)[0];

                if (val) return val;

                return {
                    value: item.key,
                    valueText: `${item.drug}`,
                    label: item.drug,
                    key: item.key,
                    dataType: 'drug',
                    exclusive: false,
                    confidential: false,
                    exportType: 'drug',
                    data: item,
                    printable,
                    selected: false,
                    extraLabels: [
                        `Dosage: ${item.dosage} ${item.drugUnit}`,
                        `Administration frequency: ${item.administrationFrequency}`,
                        `Route of Administration: ${item.routeOfAdministration}`,
                        `${item.managementText}`,
                        `${item.dosageText}`,
                    ],
                };
            })
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
