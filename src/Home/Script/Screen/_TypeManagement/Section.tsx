import React from 'react';
import { Text, Card, Br, Image } from '../../../../components';

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
