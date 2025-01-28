import React, { useRef } from 'react';

import { Box, Br, Card, Text } from '../../../../components';
import { useContext } from '../../Context';
import * as types from '../../../../types';

type TypeFluidsProps = types.ScreenTypeProps & {
    
};

export function TypeFluids({ entry }: TypeFluidsProps) {
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

    const fluids = (metadata.fluids || []) as types.DrugsLibraryItem[];

    let cachedVal = (activeScreenEntry?.values || [])[0]?.value || [];
	if (cachedVal && !cachedVal.map) cachedVal = [cachedVal];

    const canAutoFill = !mountedScreens[activeScreen?.id];
    const matched = getPrepopulationData();

    const setEntry = React.useCallback((keys?: string[]) => {
        setEntryValues(
            fluids
                .filter(d => !keys ? true : keys.includes(d.key))
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
                    extraLabels: [
                        `Dosage: ${item.dosage} ${item.drugUnit}`,
                        `Hourly dosage: ${item.hourlyDosage} ${item.drugUnit} every ${item.hourlyFeed} hours`,
                        `Administration frequency: ${item.administrationFrequency}`,
                        `Route of Administration: ${item.routeOfAdministration}`,
                        `${item.managementText}`,
                        `${item.dosageText}`,
                    ],
                }))
    );
    }, [entry, fluids, printable, setEntryValues]);

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

    return (
        <Box>
            {fluids.map(d => {
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
                            >Hourly dosage: {`${d.hourlyDosage} ${d.drugUnit} every ${d.hourlyFeed} hours`}</Text>

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
                        </Card>

                        <Br spacing="l" />
                    </React.Fragment>
                );
            })}
        </Box>
    );
}
