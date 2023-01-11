import React from 'react';
import { Box, Br, Card, Text, Radio } from '../../../components';
import { useContext } from '../Context';
import * as types from '../../../types';

type TypeChecklistProps = types.ScreenTypeProps & {
    
};

export function TypeChecklist({ searchVal }: TypeChecklistProps) {
    const ctx = useContext();
    const metadata = ctx?.activeScreen?.data?.metadata;
    const cachedVal = ctx?.activeScreenEntry?.values || [];

    const [value, setValue] = React.useState<{ [key: string]: boolean; }>(cachedVal.reduce((acc: any, v) => ({
        ...acc,
        [v.value]: false,
    }), {}));

    const opts: any[] = metadata.items.map((item: any) => ({
        label: item.label,
        value: item.key,
        hide: searchVal ? !`${item.label}`.match(new RegExp(searchVal, 'gi')) : false,
        exclusive: item.exclusive,
        disabled: (() => {
            const exclusive = metadata.items.reduce((acc: any, item: any) => {
                if (item.exclusive) acc = item.key;
                return acc;
            }, null);
            return exclusive && value[exclusive] ? exclusive !== item.key : false;
        })(),
        item,
    }));

    return (
        <Box>
            {opts.map((o, i) => {
                const key = `${i}`;

                if (o.hide) return null;

                const isSelected = value[o.value];

                const _onChange = (selectValue: boolean) => {
                    let form = { ...value };
                    if (o.exclusive) {
                        form = { [o.value]: selectValue, };
                    } else {
                        form = { ...value, [o.value]: selectValue, };
                    }
                    setValue(form);
            
                    const keys = Object.keys(form).filter(key => form[key]);
                    ctx?.setEntryValues(!keys.length ? undefined : keys.reduce((acc: types.ScreenEntryValue[], value) => {
                        const item = opts.filter(opt => opt.value === o.value)[0].item;
                        return [
                            ...acc,
                            {
                                value,
                                valueText: item.label,
                                label: item.label,
                                key: metadata.key || item.key,
                                type: item.type,
                                dataType: item.dataType,
                                exclusive: item.exclusive,
                            },
                        ];
                    }, []));
                };

                return (
                    <React.Fragment key={key}>
                        <Card>
                            <Text variant="title3">{o.label}</Text>

                            <Br />

                            <Box flexDirection="row" justifyContent="flex-end">
                                <Box>
                                    <Radio
                                        label="Yes"
                                        checked={isSelected}
                                        onChange={() => _onChange(true)}
                                        disabled={o.disabled}
                                    />
                                </Box>

                                <Box paddingLeft="xl">
                                    <Radio
                                        label="No"
                                        checked={!isSelected}
                                        onChange={() => _onChange(false)}
                                        disabled={o.disabled}
                                    />
                                </Box>
                            </Box>
                        </Card>
                        <Br spacing="l" />
                    </React.Fragment>
                )
            })}
        </Box>
    );
}
