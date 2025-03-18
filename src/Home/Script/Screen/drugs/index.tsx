import React, { useState } from 'react';

import { Box, Br, Card, Dropdown, TextInput, Modal, Text, Radio } from '@/src/components';
import * as types from '@/src/types';
import { useContext } from '../../Context';

type TypeDrugsProps = types.ScreenTypeProps & {
    
};

export function TypeDrugs({ entry }: TypeDrugsProps) {
    const {
        activeScreen,
        activeScreenEntry,
        setEntryValues,
    } = useContext();

    const reasons: { value: string; label: string; }[] = (activeScreen?.data?.reasons || []).map((item: any) => ({
        value: item.key,
        label: item.value,
    }));
    const metadata = activeScreen?.data?.metadata;
    const printable = activeScreen?.data?.printable !== false;

    const drugs = (metadata.drugs || []) as types.DrugsLibraryItem[];

    let cachedVal = (activeScreenEntry?.values || [])[0]?.value || [];
	if (cachedVal && !cachedVal.map) cachedVal = [cachedVal];

    const [values, setValues] = useState<types.ScreenEntryValue[]>(entry?.values || []);
    const [currentDrug, setCurrentDrug] = useState<null | { key: string; reason: string; other?: boolean; }>(null);

    const onSelect = React.useCallback((drug: types.DrugsLibraryItem, isSelected: boolean) => {
        let _values: typeof values = []; 
        setValues(prev => {
            _values = [
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
                    printable: printable && isSelected,
                    selected: isSelected,
                    extraLabels: [
                        `Dosage: ${drug.dosage} ${drug.drugUnit}`,
                        `Administration frequency: ${drug.administrationFrequency}`,
                        `Route of Administration: ${drug.routeOfAdministration}`,
                        `${drug.managementText}`,
                        `${drug.dosageText}`,
                    ],
                },
            ];
            return _values;
        });
        setTimeout(() => {
            const completed = drugs.length === _values.length;
            setEntryValues(completed ? _values : undefined);
        }, 0);
    }, [drugs, setEntryValues]);

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
            const completed = drugs.length === _values.length;
            setEntryValues(completed ? _values : undefined);
        }, 0);
    }, [currentDrug, drugs, setValues, setEntryValues]);

    return (
        <Box>
            <Modal
                open={!!currentDrug}
                title={<Text>Reason for not administering drug</Text>}
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

            {drugs.map(d => {
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
