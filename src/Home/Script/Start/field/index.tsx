import { Box, Radio, Text } from '../../../../components';
import { Search } from './search';
import { getNuidSearchBehaviour } from '@/src/utils/nuid-search-role';

export function Field({ field, value, onChange,script_type }: {
    field: {
        key: string;
        condition: string;
        label: string;
        values: string;
        optional?: boolean;
        type: 'dropdown' | 'text';
        searchRole?: string;
    },
    value: any,
    onChange: (value: any) => void;
    script_type?:string
}) {
    const { isTwinSearch: isTwinSearchField, suppliesSessionUid } = getNuidSearchBehaviour(field);
    const label = `${field.label || ''}${field.optional ? '' : ' *'}`;
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
                    <Text>{label}</Text>

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
                                        onDeselect={() => {
                                            onChange(null);
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
                        label={label}
                        prePopulateWithUID={true}
                        useSearchedUidForSession={suppliesSessionUid}
                        noRecordTitle={isTwinSearchField ? 'Twin record not found' : undefined}
                        noRecordMessage={isTwinSearchField
                            ? (uid => `No twin record was found for ${uid}. You can continue without twin pre-population. A new Neotree ID will be generated for this baby.`)
                            : undefined}
                        onSession={value => onChange(value)}
                        script_type={script_type}
                    />
                </>
            )}
        </>
    );
}
