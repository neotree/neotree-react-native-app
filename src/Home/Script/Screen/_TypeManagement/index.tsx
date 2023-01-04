import React from 'react';
import { Box, Br } from '../../../../components';
import { useContext } from '../../Context';
import { MgtSection } from './Section';
import * as types from '../../../../types';

type TypeManagementProps = types.ScreenTypeProps & {
    
};

export function TypeManagement({}: TypeManagementProps) {
    const ctx = useContext();

    const metadata = ctx?.activeScreen?.data?.metadata;

    return (
        <Box>
            <MgtSection 
                title={metadata.title1}
                text={metadata.text1}
                image={metadata.image1?.data}
            />

            <Br />

            <MgtSection 
                title={metadata.title2}
                text={metadata.text2}
                image={metadata.image2?.data}
            />

            <Br />

            <MgtSection 
                title={metadata.title3}
                text={metadata.text3}
                image={metadata.image3?.data}
            />
        </Box>
    );
}
