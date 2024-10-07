import React from 'react';
import { Br } from '../Br';
import { Box } from '../Theme';
import { MgtSection } from './Section';

type ManagementScreenProps = {
    data: any;
};

export function ManagementScreen({ data }: ManagementScreenProps) {
    return (
        <Box>
            <MgtSection 
                title={data.title1}
                text={data.text1}
                image={data.image1?.data}
                textStyle={data.text1Style}
            />

            <Br />

            <MgtSection 
                title={data.title2}
                text={data.text2}
                image={data.image2?.data}
                textStyle={data.text2Style}
            />

            <Br />

            <MgtSection 
                title={data.title3}
                text={data.text3}
                image={data.image3?.data}
                textStyle={data.text3Style}
            />
        </Box>
    );
}
