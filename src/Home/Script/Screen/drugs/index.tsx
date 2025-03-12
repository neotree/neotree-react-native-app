import React, { useRef } from 'react';

import { Box, Br, Card, Text, Radio } from '@/src/components';
import * as types from '@/src/types';
import { useContext } from '../../Context';

type TypeDrugsProps = types.ScreenTypeProps & {
    
};

export function TypeDrugs({ entry }: TypeDrugsProps) {
    const mounted = useRef(false);
    const autoFilled = useRef(false);
    
    const {
        activeScreen,
        activeScreenEntry,
        mountedScreens,
        getPrepopulationData,
        setEntryValues
    } = useContext();

    const metadata = activeScreen?.data?.metadata;
    const printable = activeScreen?.data?.printable !== false;

    const drugs = (metadata.drugs || []) as types.DrugsLibraryItem[];

    let cachedVal = (activeScreenEntry?.values || [])[0]?.value || [];
	if (cachedVal && !cachedVal.map) cachedVal = [cachedVal];

    const canAutoFill = !mountedScreens[activeScreen?.id];
    const matched = getPrepopulationData();

    const setEntry = React.useCallback((keys?: string[]) => {
        setEntryValues(
            drugs
                .filter(d => !keys ? true : keys.includes(d.key!))
                .map(item => ({
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
                    selected: (entry?.values || []).filter(v => v.key === item.key)[0]?.selected,
                    extraLabels: [
                        `Dosage: ${item.dosage} ${item.drugUnit}`,
                        `Administration frequency: ${item.administrationFrequency}`,
                        `Route of Administration: ${item.routeOfAdministration}`,
                        `${item.managementText}`,
                        `${item.dosageText}`,
                    ],
                }))
        );
    }, [drugs, entry, setEntryValues]);

    React.useEffect(() => {
        if (canAutoFill && !autoFilled.current) {
            const _value: any = {};
            const _matched = matched[metadata.key]?.values?.value || [];
            _matched.forEach((m: string) => { _value[m] = true; });
            if (Object.keys(_value).length) setEntry(Object.keys(_value));
            autoFilled.current = true;
        }
    }, [canAutoFill, matched, metadata, setEntry]);

    React.useEffect(() => {
        if (!mounted.current) {
            mounted.current = true;
            setEntry();
        }
    }, [setEntry]);

    const onSelect = React.useCallback((key: string, isSelected: boolean) => {
        setEntryValues(
            (entry?.values || []).map(v => {
                if (v.key !== key) return v;
                return { ...v, selected: isSelected, };
            })
        );
    }, [entry, setEntryValues]);

    return (
        <Box>
            {drugs.map(d => {
                const isSelected = (entry?.values || []).filter(v => v.key === d.key)[0]?.selected === true;
                
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
