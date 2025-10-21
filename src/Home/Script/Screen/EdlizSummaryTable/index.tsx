import React, { useMemo } from 'react';

import { useScriptContext } from '@/src/contexts/script';
import { Box, Text, Select, Br } from '../../../../components';
import * as types from '../../../../types';
import ucFirst from '../../../../utils/ucFirst';

type EdlizSummaryTableProps = types.ScreenTypeProps & {
    
};

export function EdlizSummaryTable({ searchVal }: EdlizSummaryTableProps) {
    const { activeScreen, activeScreenEntry, setEntryValues } = useScriptContext();
    const metadata = activeScreen?.data?.metadata;
    const cachedVal = (activeScreenEntry?.values || [])[0]?.value;

    const [values, setValues] = React.useState<any[]>(cachedVal || []);

    const groupedItems = useMemo(() => {
        return metadata.items.reduce((acc: any, item: any) => ({
            ...acc,
            [item.type]: [...(acc[item.type] || []), item],
        }), {}) as Record<string, any[]>;
    }, [metadata.items]);

    React.useEffect(() => {
        let allSectionsSelected = true;

        Object.keys(groupedItems).forEach(section => {
            const items = groupedItems[section];
            if (!values.find(v => items.map(item => item.id).includes(v.value))) allSectionsSelected = false;
        });

        let score = 0;
        if (values) {
            score = values.reduce((acc, v) => {
                if (v.score >= 0) return acc + v.score;

                if (activeScreen.type === 'mwi_edliz_summary_table') {
					acc += 1;
				} else {
					if (v.type === 'major_criteria') acc += 2;
                	if (v.type === 'minor_criteria') acc += 1;
				}
                return acc;
            }, 0);
        }

        if (allSectionsSelected && values?.length) {
            setEntryValues(
                [{
                    key: metadata.key,
                    type: metadata.dataType,
                    value: values,
                    score,
                }], 
                {
                    value: [{
                        value: score,
                        label: metadata.label,
                        key: metadata.key,
                        type: metadata.dataType ? metadata.dataType : null,
                        valueText: score,
                        score,
                    }],
                }
            );
        } else {
            setEntryValues(undefined);
        }
    }, [values, activeScreen, groupedItems]);

    const renderItems = (items: any[] = []) => {
        return (
           <>
                <Select
                    multiple
                    value={values.map(e => e.value)}
                    options={items.map(item => {
                        const exclusiveValue = values
                            .filter(e => items.map(item => item.id).includes(e.value))
                            .find(v => v.exclusive);

                        return {
                            label: item.label,
                            value: item.id,
                            hide: searchVal ? !`${item.label}`.match(new RegExp(searchVal, 'gi')) : false,
                            textVariant: 'body',
                            data: item,
                            disabled: !exclusiveValue ? false : exclusiveValue?.value !== item.id,
                        };
                    })}
                    onChange={({ index: i }) => {
                        const { index } = items[i];
                        const item = (metadata.items || [])[index];
                        const checked = values.map(s => s.value).indexOf(item.id) > -1;
                        const value = item.id;
                        const _checked = !checked;
                        const score = isNaN(Number(item.score)) ? undefined : Number(item.score);

                        const _entry = {
                            value,
                            valueText: item.label,
                            label: item.label,
                            key: item.key,
                            type: item.type,
                            dataType: item.dataType,
                            exclusive: item.exclusive,
                            confidential: item.confidential,
                            score,
                        };

                        setValues(prev => {
                            let values = _checked ? 
                                (
                                    item.exclusive ? 
                                        [...prev.filter(e => !items.map(item => item.id).includes(e.value)), _entry] 
                                        : 
                                        [...prev, _entry]
                                )
                                : 
                                prev.filter(s => s.value !== value);
                            return values;
                        });
                    }}
                />
                <Br spacing="xl" />
           </>
        );
    };

    return (
        <Box>
            {Object.keys(groupedItems).map(type => {
                return (
                    <React.Fragment key={type}>
                        <Text variant="title3">{ucFirst((type || '').replace(/_/gi, ' '))}</Text>

                        <Br spacing="s" />

                        {renderItems(metadata.items
                            .map((item: any, index: any) => ({ ...item, index }))
                            .filter((item: any) => item.type === type))}
                    </React.Fragment>
                );
            })}
        </Box>
    );
}
