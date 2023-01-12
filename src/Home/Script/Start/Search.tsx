import React from 'react';
import { Box, Br, Button, NeotreeIDInput } from '../../../components';
import { useContext } from '../Context';

type SearchProps = {
    
};

export function Search({}: SearchProps) {
    const ctx = useContext();
    const [uid, setUID] = React.useState('');

    return (
        <Box>
            <NeotreeIDInput
                label="Search existing NUID"
                onChange={uid => setUID(uid)}
                value={uid}
                application={ctx?.application}
            />
            
            <Br />

            <Button 
                color="secondary"
            >Search</Button>
        </Box>
    );
}
