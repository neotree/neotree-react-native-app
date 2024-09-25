import React from 'react';
import { TextProps } from 'react-native';

import { Text } from '../Theme';
import { Card } from '../Card';
import { Image } from '../Image';
import { Br } from '../Br';

type MgtSectionProps = {
    title?: string;
    text?: string;
    image?: string;
    textStyle?: TextProps['style'];
};

export function MgtSection({ title, text, image, textStyle }: MgtSectionProps) {
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
                    <Text style={textStyle}>{text}</Text>
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
