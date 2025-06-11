import React from 'react';

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

    React.useEffect(() => {
        let score = 0;
        if (values) {
            score = values.reduce((acc, v) => {
                if (activeScreen.type === 'mwi_edliz_summary_table') {
					acc += 1;
				} else {
					if (v.type === 'major_criteria') acc += 2;
                	if (v.type === 'minor_criteria') acc += 1;
				}
                return acc;
            }, 0);
        }
        setEntryValues([{
            key: metadata.key,
            type: metadata.dataType,
            value: values,
        }], {
            value: [{
                value: score,
                label: metadata.label,
                key: metadata.key,
                type: metadata.dataType ? metadata.dataType : null,
                valueText: score,
            }],
        });
    }, [values, activeScreen]);

    const renderItems = (items: any[] = []) => {
        return (
           <>
                <Select
                    multiple
                    value={values.map(e => e.value)}
                    options={items.map(item => ({
                        label: item.label,
                        value: item.id,
                        hide: searchVal ? !`${item.label}`.match(new RegExp(searchVal, 'gi')) : false,
                        textVariant: 'body',
                        data: item,
                    }))}
                    onChange={({ index: i }) => {
                        const { index } = items[i];
                        const item = (metadata.items || [])[index];
                        const checked = values.map(s => s.value).indexOf(item.id) > -1;
                        const value = item.id;
                        const _checked = !checked;

                        const _entry = {
                            value,
                            valueText: item.label,
                            label: item.label,
                            key: item.key,
                            type: item.type,
                            dataType: item.dataType,
                            exclusive: item.exclusive,
                            confidential: item.confidential,
                        };

                        setValues(prev => {
                            const values = _checked ? [...prev, _entry] : prev.filter(s => s.value !== value);
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
            {Object.keys(metadata.items.reduce((acc: any, item: any) => ({
                ...acc,
                [item.type]: [...(acc[item.type] || []), item],
            }), {})).map(type => {
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
