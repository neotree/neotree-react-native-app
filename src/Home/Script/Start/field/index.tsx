import { Box, Radio, Text } from '../../../../components';
import { Search } from './search';

export function Field({ field, value, onChange,script_type }: {
    field: {
        key: string;
        condition: string;
        label: string;
        values: string;
        type: 'dropdown' | 'text';
    },
    value: any,
    onChange: (value: any) => void;
    script_type?:string
}) {
    const opts = (field.values || '').split('\n')
        .map((v = '') => v.trim())
        .filter((v: any) => v)
        .map((v: any) => {
            v = v.split(',');
            return { value: v[0], label: v[1], };
        });

    return (
        <>

            {field.type === 'dropdown' ? (
                <>
                    <Text>{field.label}</Text>

                    <Box 
                        {...(opts.length > 2 ? {
                            columnGap: 'm',
                        } : {
                            flexDirection: 'row',
                            alignItems: 'center',
                        })}
                    >
                        {opts.map((o, i) => {
                            return (
                                <Box marginLeft={i ? 'xl' : undefined} key={o.label}>
                                    <Radio                            
                                        label={o.label}
                                        checked={value === o.value}
                                        onChange={() => {
                                            onChange(o.value);
                                        }}
                                    />
                                </Box>
                            )
                        })}           
                    </Box>
                </>
            ): (
                <>
                    <Search
                        label={field.label}
                        prePopulateWithUID={true}
                        onSession={value => onChange(value)}
                        script_type={script_type}
                    />
                </>
            )}
        </>
    );
}
