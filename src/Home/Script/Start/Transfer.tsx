import React from 'react';
import { Box, Br, Radio, Text, } from '../../../components';
import { Search } from './Search';

type TransferProps = {

};

export function Transfer({}: TransferProps) {
    const [isTransferred, setIsTransferred] = React.useState<null | boolean>(null); 

    return (
        <Box>
            <Text>Has the baby been transferred from another facility?</Text>
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
                                checked={isTransferred === o.value}
                                onChange={() => {
                                    setIsTransferred(o.value);
                                }}
                            />
                        </Box>
                    )
                })}                
            </Box>

            <Br spacing="xl" />

            {isTransferred && (
				<Search 
					label="Search patient's NUID" 
					autofillKeys={['BirthFacility', 'OtherBirthFacility']}
				/>
			)}
        </Box>
    )
}
