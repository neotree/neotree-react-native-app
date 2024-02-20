import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Box, Br, Card, Text } from '../../../components';
import { useContext } from '../Context';
import * as types from '../../../types';

type TypeMultiSelectProps = types.ScreenTypeProps & {
    
};

export function TypeMultiSelect({ searchVal }: TypeMultiSelectProps) {
    const ctx = useContext();
    const metadata = ctx?.activeScreen?.data?.metadata;

    let cachedVal = (ctx?.activeScreenEntry?.values || [])[0]?.value || [];
	if (cachedVal && !cachedVal.map) cachedVal = [cachedVal];

    const canAutoFill = !ctx?.mountedScreens[ctx?.activeScreen?.id];
    const matched = ctx?.matched;

    const [value, setValue] = React.useState<{ [key: string]: boolean; }>(cachedVal.reduce((acc: any, v: any) => ({
        ...acc,
        [v.value]: true,
    }), {}));

    function onChange(_value: typeof value) {
        setValue(_value);
        const keys = Object.keys(_value).filter(key => _value[key]);
		const values = keys.reduce((acc: types.ScreenEntryValue[], value) => {
            const item = metadata.items.filter((item: any) => item.id === value)[0];
            return [
                ...acc,
                {
                    value,
					valueLabel: item.label,
                    valueText: item.label,
                    label: item.label,
                    key: item.id,
					inputKey: metadata.key,
                    dataType: item.dataType,
                    exclusive: item.exclusive,
                    confidential: item.confidential,
                },
            ];
        }, []);
        ctx.setEntryValues(!keys.length ? undefined : [
			{
				value: values,
				key: metadata.key,
				label: metadata.label,
				type: metadata.dataType,
			}
		]);
    }

    const opts: any[] = metadata.items.map((item: any) => {
        return {
            label: item.label,
            value: item.id,
            hide: searchVal ? !`${item.label}`.match(new RegExp(searchVal, 'gi')) : false,
            exclusive: item.exclusive,
            disabled: (() => {
                const exclusive = metadata.items.reduce((acc: any, item: any) => {
                if (item.exclusive) acc = item.id;
                    return acc;
                }, null);
                return exclusive && value[exclusive] ? exclusive !== item.id : false;
            })(),
            onChange: () => {
                let form = { ...value };
                if (item.exclusive) {
                    form = { [item.id]: !form[item.id], };
                } else {
                    form = { ...form, [item.id]: !form[item.id], }; 
                }                         
                onChange(form);
            },
          };
    });

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
                                    textAlign="center"
                                    variant="title3"
                                >{o.label}</Text>
                            </Card>
                        </TouchableOpacity>

                        <Br spacing="l" />
                    </React.Fragment>
                )
            })}
        </Box>
    );
}
