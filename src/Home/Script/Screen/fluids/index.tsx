import React, { useState } from 'react';

import { Box, Br, Card, Dropdown, Modal, Text, TextInput, Radio } from '../../../../components';
import { useContext } from '../../Context';
import * as types from '../../../../types';

type TypeFluidsProps = types.ScreenTypeProps & {
    
};

export function TypeFluids({ entry }: TypeFluidsProps) {
    const {
        activeScreen,
        setEntryValues
    } = useContext();

    const reasons: { value: string; label: string; }[] = (activeScreen?.data?.reasons || []).map((item: any) => ({
        value: item.key,
        label: item.value,
    }));
    const metadata = activeScreen?.data?.metadata;
    const printable = activeScreen?.data?.printable !== false;

    const fluids = (metadata.fluids || []) as types.DrugsLibraryItem[];

    const [values, setValues] = useState<types.ScreenEntryValue[]>(entry?.values || []);
    const [currentDrug, setCurrentDrug] = useState<null | { key: string; reason: string; other?: boolean; }>(null);

    const onSelect = React.useCallback((fluid: types.DrugsLibraryItem, isSelected: boolean) => {
        let _values: typeof values = []; 
        setValues(prev => {
            _values = [
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
                    printable: printable && isSelected,
                    selected: isSelected,
                    extraLabels: [
                        `Hourly volume: ${fluid.hourlyDosage} ${fluid.drugUnit} every ${fluid.hourlyFeed} hours`,
                        `Administration frequency: ${fluid.administrationFrequency}`,
                        `Route of Administration: ${fluid.routeOfAdministration}`,
                        `${fluid.managementText}`,
                        `${fluid.dosageText}`,
                    ],
                },
            ];
            return _values;
        });
        setTimeout(() => {
            const completed = fluids.length === _values.length;
            setEntryValues(completed ? _values : undefined);
        }, 0);
    }, [fluids, setEntryValues]);

    const closeModal = React.useCallback(() => {
        let _values: typeof values = []; 
        setCurrentDrug(null);
        setValues(prev => {
            if (!currentDrug?.reason) {
                _values = prev.filter(d => d.key !== currentDrug?.key);
            } else {
                _values = prev.map(v => {
                    if (v !== currentDrug.key) return v;
                    const valueText = `${v.valueText} (${currentDrug.reason})`;
                    return {
                        ...v,
                        valueText,
                    };
                });
            }
            return _values;
        });
        setTimeout(() => {
            const completed = fluids.length === _values.length;
            setEntryValues(completed ? _values : undefined);
        }, 0);
    }, [currentDrug, fluids, setValues, setEntryValues]);

    return (
        <Box>
            <Modal
                open={!!currentDrug}
                title="Reason for not administering fluid"
                onClose={closeModal}
                onRequestClose={closeModal}
                actions={[
                    {
                        label: 'Close',
                        onPress: () => closeModal(),
                    },
                ]}
            >
                <Box>
                    <Dropdown
                        disabled={!reasons.length}
                        label=""
                        title=""
                        searchable={false}
                        value={currentDrug?.reason}
                        options={reasons}
                        onChange={(val) => {
                            setCurrentDrug(prev => ({ ...prev!, reason: `${val}`, other: undefined, }));
                            setTimeout(closeModal, 0);
                        }}
                    />

                    <Box mt="l">
                        {!!currentDrug?.other ? (
                            <Box mt="l">
                                <TextInput
                                    editable={!reasons.filter(r => r.value === currentDrug?.reason)[0]}
                                    label="Other (Optional)"
                                    value={currentDrug.reason}
                                    numberOfLines={3}
                                    onChangeText={v => setCurrentDrug(prev => ({ ...prev!, reason: v, }))}
                                />
                            </Box>
                        ) : (
                            <Radio
                                label="Other"
                                checked={currentDrug?.other}
                                onChange={() => {
                                    setCurrentDrug(prev => ({ ...prev!, reason: '', other: true, }));
                                }}
                                disabled={false}
                            />
                        )}
                    </Box>
                </Box>
            </Modal>

            {fluids.map(d => {
                const isSelected = values.filter(v => v.key === d.key)[0]?.selected === true;
                const isNotSelected = values.filter(v => v.key === d.key)[0]?.selected === false;

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
                                            checked={isNotSelected}
                                            onChange={() => {
                                                onSelect(d, false);
                                                setCurrentDrug({ key: d.key, reason: '', other: !reasons.length, });
                                            }}
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
