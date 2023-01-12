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
    const canAutoFill = !ctx?.mountedScreens[ctx?.activeScreen?.id];
    const matched = ctx?.matched;

    const [value, setValue] = React.useState<{ [key: string]: boolean; }>(cachedVal.reduce((acc: any, v) => ({
        ...acc,
        [v.value]: false,
    }), {}));

    function onChange(_value: typeof value) {
        setValue(_value);
        const keys = Object.keys(_value).filter(key => _value[key]);
        ctx?.setEntryValues(!keys.length ? undefined : keys.reduce((acc: types.ScreenEntryValue[], value) => {
            const item = metadata.items.filter((item: any) => item.key === value)[0];
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
    }

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
        onChange: (selectValue: boolean) => {
            let form = { ...value };
            if (item.exclusive) {
                form = { [item.value]: selectValue, };
            } else {
                form = { ...value, [item.value]: selectValue, };
            }
            onChange(form);
        },
    }));

    React.useEffect(() => {
        if (canAutoFill) {
            const _value: any = {};
            const _matched = (matched?.autoFill?.data?.entries || {})[metadata.key]?.values?.value || [];
            _matched.forEach((m: string) => { _value[m] = true; });
            if (_matched.length) onChange(_value);
        }
    }, [canAutoFill, matched, metadata]);

    return (
        <Box>
            {opts.map((o, i) => {
                const key = `${i}`;

                if (o.hide) return null;

                const isSelected = value[o.value];

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
                                        onChange={() => o.onChange(true)}
                                        disabled={o.disabled}
                                    />
                                </Box>

                                <Box paddingLeft="xl">
                                    <Radio
                                        label="No"
                                        checked={!isSelected}
                                        onChange={() => o.onChange(false)}
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
