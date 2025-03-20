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
    const [currentDrug, setCurrentDrug] = useState<null | { 
        key: string; 
        other?: boolean;
        comment: { key?: string, label: string, }; 
    }>(null);

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
            setValues(prev => {
                const comments = currentDrug?.comment?.label ? [currentDrug?.comment] : undefined;
                _values = prev
                    .map(v => {
                        if (v.key !== currentDrug?.key) return v;
                        return { ...v, comments, };
                    })
                    .filter(v => v.selected ? true : !!v.comments?.length);
                return _values;
            });
            setCurrentDrug(null);
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
                        value={currentDrug?.comment?.key}
                        options={reasons}
                        onChange={(_, o) => {
                            setCurrentDrug(prev => ({ 
                                ...prev!, 
                                other: undefined,
                                comment: { key: `${o.value}`, label: `${o.label}`, }, 
                            }));
                        }}
                    />

                    <Box mt="l">
                        {!!currentDrug?.other ? (
                            <Box mt="l">
                                <TextInput
                                    label="Other (Optional)"
                                    value={currentDrug.comment?.label || ''}
                                    numberOfLines={3}
                                    onChangeText={v => setCurrentDrug(prev => ({ ...prev!, comment: { label: v, }, }))}
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
                const val = values.filter(v => v.key === d.key)[0];
                const isSelected = val?.selected === true;
                const isNotSelected = val?.selected === false;
                const comments = val?.comments || [];

                return (
                    <React.Fragment key={d.key}>
                        <Card>
                            <Text
                                variant="title3"
                            >{d.drug}</Text>

                            <Text
                                color="textSecondary"
                                mt="s"
                            >Volume: {`${d.hourlyDosage} ${d.drugUnit} every ${d.hourlyFeed} hours`}</Text>

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
                                                setCurrentDrug({ 
                                                    key: d.key, 
                                                    other: !reasons.length,
                                                    comment: comments[0] || { label: '', }, 
                                                });
                                            }}
                                            disabled={false}
                                        />
                                    </Box>
                                </Box>

                                {!!comments.length && (
                                    <Box mt="s" alignItems="flex-end">
                                        <Text
                                            color="error"
                                        >{comments[0].label}</Text>
                                    </Box>
                                )}
                            </Box>
                        </Card>

                        <Br spacing="l" />
                    </React.Fragment>
                );
            })}
        </Box>
    );
}
