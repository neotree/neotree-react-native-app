import React from 'react';
import { Text } from '../Theme';
import { Card } from '../Card';
import { Image } from '../Image';
import { Br } from '../Br';

type MgtSectionProps = {
    title?: string;
    text?: string;
    image?: string;
};

export function MgtSection({ title, text, image }: MgtSectionProps) {
    if (!(title || text || image)) return null;
    
    return (
        <Card>
            {!!title && (
                <>
                    <Text variant="title3" fontWeight="bold">{title}</Text>
                    <Br />
                </>
            )}

            {!!text && (
                <>
                    <Text>{text}</Text>
                    <Br />
                </>
            )}

            {!!image && (
                <>
                    <Image
                        fullWidth
                        resizeMode="contain"
                        source={{ uri: image }}
                    />
                    <Br />
                </>
            )}
        </Card>
    );
}
