import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Br } from '../Br';
import { Card } from '../Card';
import { Text, Theme } from '../Theme';

type SelectOption = {
    disabled?: boolean;
    exclusive?: boolean;
    value: string | number;
    label: string | number;
    textVariant?: keyof Theme['textVariants'];
    data?: any;
};

export type SelectProps = {
    multiple?: boolean;
    options: SelectOption[];
    value: number | string | (number | string)[];
    onChange: (params: {
        option: SelectOption;
        index: number;
        values: (number | string)[];
    }) => void;
};

export function Select({
    options,
    value: valueProp,
    onChange,
    multiple,
}: SelectProps) {
    const value = (['string', 'number'].includes(typeof valueProp) ? [valueProp] : valueProp) as (string | number)[];
    
    return (
        <>
            {options.map((o, i) => {
                const key = `${o.value}${i}`;
                const isSelected = value.indexOf(o.value) > -1;

                return (
                    <React.Fragment key={key}>
                        <TouchableOpacity
                            disabled={o.disabled}
                            onPress={() => {
                                if (multiple) {
                                    onChange({
                                        option: o,
                                        index: i,
                                        values: isSelected ? value.filter((_, j) => i !== j) : [...value, o.value],
                                    });
                                } else {
                                    onChange({
                                        option: o,
                                        index: i,
                                        values: isSelected ? [] : [o.value],
                                    });
                                }
                            }}
                        >
                            <Card
                                backgroundColor={o.disabled ? 'disabledBackground' : (isSelected ? "primary" : undefined)}
                            >
                                <Text 
                                    variant={o.textVariant || 'title3'}
                                    color={o.disabled ? 'textDisabled' : (isSelected ? 'primaryContrastText' : undefined)}
                                >{o.label}</Text>
                            </Card>
                        </TouchableOpacity>
                        <Br spacing="m" />
                    </React.Fragment>
                )
            })}
        </>
    );
}
