import React from 'react';
import { Box, Br, Radio, Text, } from '../../../components';
import { Search } from './Search';

export function Twin() {
    const [isTwin, setIsTwin] = React.useState<null | boolean>(null); 

    return (
        <Box>
            <Text>Does the baby have a twin?</Text>
            <Br spacing='s'/>
            <Box flexDirection="row" alignItems="center">
                {[
                    { label: 'Yes', value: true, },
                    { label: 'No', value: false, },
                ].map((o, i) => {
                    return (
                        <Box marginLeft={i ? 'xl' : undefined} key={o.label}>
                            <Radio                            
                                label={o.label}
                                checked={isTwin === o.value}
                                onChange={() => {
                                    setIsTwin(o.value);
                                }}
                                onDeselect={() => {
                                    setIsTwin(null);
                                }}
                            />
                        </Box>
                    )
                })}                
            </Box>

            <Br spacing="xl" />

            {isTwin && (
				<Search 
					label="Search patient's NUID" 
					filterEntries={e => e.prePopulate && e.prePopulate.includes('twinSearches')}
					prePopulateWithUID={false}
                    useSearchedUidForSession={false}
                    noRecordTitle="Twin record not found"
                    noRecordMessage={uid => `No twin record was found for ${uid}. You can continue without twin pre-population. A new Neotree ID will be generated for this baby.`}
				/>
			)}
        </Box>
    )
}
