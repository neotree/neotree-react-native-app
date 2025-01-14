import React, { useRef } from 'react';
import { TouchableOpacity } from 'react-native';
import { Box, Br, Card, Text } from '../../../../components';
import { useContext } from '../../Context';
import * as types from '../../../../types';

type TypeDrugsProps = types.ScreenTypeProps & {
    
};

export function TypeDrugs({ searchVal, entry }: TypeDrugsProps) {
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

    const [value, setValue] = React.useState<{ [key: string]: boolean; }>(cachedVal.reduce((acc: any, v: any) => ({
        ...acc,
        [v.value]: true,
    }), {}));

    function onChange(_value: typeof value) {
        setValue(_value);
        const keys = Object.keys(_value).filter(key => _value[key]);
		const values = keys.reduce((acc: types.ScreenEntryValue[], value) => {
            const item = drugs.filter((item: any) => item.key === value)[0];
            return [
                ...acc,
                {
                    value,
                    valueText: `${item.drug} (${item.dosage} ${item.drugUnit})`,
                    label: item.drug,
                    key: item.key,
                    dataType: 'drug',
                    exclusive: false,
                    confidential: false,
                    exportType: 'drug',
                    data: item,
                    printable,
                    extraLabels: [
                        `Route of Administration: ${item.routeOfAdministration}`,
                        `Administration frequency: ${item.administrationFrequency}`,
                        `Dosage: ${item.dosage} ${item.drugUnit}`,
                        `${item.dosageText}`,
                        `${item.managementText}`,
                    ],
                },
            ];
        }, []);
        setEntryValues && setEntryValues(!keys.length ? undefined : values);
    }

    const opts = drugs.map((item) => {
        return {
            data: item,
            label: item.drug,
            value: item.key,
            hide: searchVal ? !`${item.drug}`.match(new RegExp(searchVal, 'gi')) : false,
            exclusive: false,
            disabled: false,
            onChange: () => {
                let form = { ...value };
                form = { ...value, [item.key]: !form[item.key], };                        
                onChange(form);
            },
          };
    });

    React.useEffect(() => {
        if (canAutoFill && !autoFilled.current) {
            const _value: any = {};
            const _matched = matched[metadata.key]?.values?.value || [];
            _matched.forEach((m: string) => { _value[m] = true; });
            if (_matched.length) onChange(_value);
            autoFilled.current = true;
        }
    }, [canAutoFill, matched, metadata]);

    React.useEffect(() => {
        if (!mounted.current) {
            mounted.current = true;
            setEntryValues(entry?.values || []);
        }
    }, [entry]);

    return (
        <Box>
            {opts.map(o => {
                if (o.hide) return null;

                const isSelected = value[o.value];

                return (
                    <React.Fragment key={o.value}>
                        <TouchableOpacity 
                            disabled={o.disabled}
                            onPress={() => o.onChange()}
                        >
                            <Card 
                                backgroundColor={o.disabled ? 'disabledBackground' : (isSelected ? 'primary' : undefined)}
                            >
                                <Text
                                    color={o.disabled ? 'grey-500' : (isSelected ? 'primaryContrastText' : undefined)}
                                    variant="title3"
                                >{o.data.drug}</Text>

                                <Text
                                    color={o.disabled ? 'grey-500' : (isSelected ? 'primaryContrastText' : 'textSecondary')}
                                    mt="s"
                                >Route of Administration: {o.data.routeOfAdministration}</Text>

                                <Text
                                    color={o.disabled ? 'grey-500' : (isSelected ? 'primaryContrastText' : 'textSecondary')}
                                    mt="s"
                                >Administration frequency: {o.data.administrationFrequency}</Text>

                                <Text
                                    color={o.disabled ? 'grey-500' : (isSelected ? 'primaryContrastText' : 'textSecondary')}
                                    mt="s"
                                >Dosage: {`${o.data.dosage} ${o.data.drugUnit}`}</Text>

                                <Text
                                    color={o.disabled ? 'grey-500' : (isSelected ? 'primaryContrastText' : 'textSecondary')}
                                    mt="s"
                                >{o.data.dosageText}</Text>

                                <Text
                                    color={o.disabled ? 'grey-500' : (isSelected ? 'primaryContrastText' : 'textSecondary')}
                                    mt="s"
                                >{o.data.managementText}</Text>
                            </Card>
                        </TouchableOpacity>

                        <Br spacing="l" />
                    </React.Fragment>
                )
            })}
        </Box>
    );
}
