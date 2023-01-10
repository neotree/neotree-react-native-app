import React from 'react';
import { Box, Text, Card, Image, Br } from '../../../../components';
import * as types from '../../../../types';

type FullDiagnosisProps = types.DiagnosisSectionProps & {
    
};

function ManagementCard({ text, image, }: { text?: any; image?: any; }) {
    if (!(text || image)) return null;

    return (
        <>
            <Card>
                {!!text && <Text variant="title3">{text}</Text>}
                {!!image && (
                <Image
                    fullWidth
                    resizeMode="contain"
                    source={{ uri: image.data }}
                />
                )}
            </Card>
            {!!(text || image) && <Br spacing="m" />}
        </>
    );
}

export function FullDiagnosis({ acceptedDiagnoses, activeDiagnosisIndex }: FullDiagnosisProps) {
    const diagnosis = acceptedDiagnoses[activeDiagnosisIndex as number];

    if (!diagnosis) return null;

    const data = [
        { text: diagnosis.text1, image: diagnosis.image1 },
        { text: diagnosis.text2, image: diagnosis.image2 },
        { text: diagnosis.text3, image: diagnosis.image3 },
    ];

    const noData = data.reduce((acc, item) => {
        if (item.text || item.image) acc = false;
        return acc;
    }, true);

    return (
        <Box>
            {!!diagnosis.expressionMeaning && <Text style={{ marginBottom: 20 }}>{diagnosis.expressionMeaning}</Text>}
            {data.map((item, i) => {
                const key = `${i}`;
                return <ManagementCard key={key} {...item} />;
            })}
            {!noData ? null : (
                <Box marginVertical="xl">
                    <Text color="textDisabled" variant="title3" textAlign="center">Diagnosis does not have management details</Text>
                </Box>
            )}
        </Box>
    );
}
