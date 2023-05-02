import React from 'react';
import { Box, Br, Radio, Text, } from '../../../components';
import { Search } from './Search';

type TwinProps = {

};

export function Twin({}: TwinProps) {
    const [isTwin, setIsTwin] = React.useState<null | boolean>(null); 

    return (
        <Box>
            <Text>Does the baby have a twin?</Text>
            <Br />
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
				/>
			)}
        </Box>
    )
}
