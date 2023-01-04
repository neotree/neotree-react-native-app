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

    const [value, setValue] = React.useState<{ [key: string]: boolean; }>({});

    const opts: any[] = metadata.items.map((item: any) => ({
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
      }));

    return (
        <Box>
            {opts.map(o => {
                if (o.hide) return null;

                const isSelected = value[o.value];

                return (
                    <React.Fragment key={o.value}>
                        <TouchableOpacity 
                            disabled={o.disabled}
                            onPress={() => {                                
                                setValue(prev => {
                                    if (o.exclusive) return { [o.value]: !prev[o.value], };
                                    return { ...prev, [o.value]: !prev[o.value], };
                                });
                            }}
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
