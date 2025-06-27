import React, { useState, useMemo, useCallback } from 'react';

import { useScriptContext } from '@/src/contexts/script';
import { Box, Br, Card, Dropdown, TextInput, Modal, Text, Radio } from '@/src/components';
import * as types from '@/src/types';

type TypeDrugsProps = types.ScreenTypeProps & {
    
};

export function TypeDrugs({ entry }: TypeDrugsProps) {
    const {
        activeScreen,
        activeScreenEntry,
        setEntryValues,
    } = useScriptContext();

    const { 
        reasons,
        printable,
        drugs,
    } = useMemo(() => {
        const reasons: { value: string; label: string; }[] = (activeScreen?.data?.reasons || []).map((item: any) => ({
            value: item.key,
            label: item.value,
        }));

        let cachedVal = (activeScreenEntry?.values || [])[0]?.value || [];
	    if (cachedVal && !cachedVal.map) cachedVal = [cachedVal];

        return {
            cachedVal,
            reasons,
            metadata: activeScreen?.data?.metadata,
            printable: activeScreen?.data?.printable !== false,
            drugs: (activeScreen?.data?.metadata?.drugs || []) as types.DrugsLibraryItem[],
        };
    }, [activeScreen, activeScreenEntry]);

    const [values, setValues] = useState<types.ScreenEntryValue[]>(entry?.values || []);
    const [currentDrug, setCurrentDrug] = useState<null | { 
        key: string; 
        other?: boolean;
        comment: { key?: string, label: string, }; 
    }>(null);

    const onSelect = useCallback((drug: types.DrugsLibraryItem, isSelected: boolean) => {
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

    const closeModal = useCallback(() => {
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
            const completed = drugs.length === _values.length;
            setEntryValues(completed ? _values : undefined);
        }, 0);
    }, [currentDrug, drugs, setValues, setEntryValues]);

    return (
        <Box>
            <Modal
                open={!!currentDrug}
                title={<Text>Reason for not prescribing drug</Text>}
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

            {drugs.map(d => {
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
                                <Text variant="title3">Do you plan to prescribe this drug?</Text>
    
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
