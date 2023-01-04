import React from 'react';
import { Image as RNImage, ImageProps as RNImageProps, LayoutRectangle } from 'react-native';

export type ImageProps = RNImageProps & {
    fullWidth?: boolean;
};

export const Image = ({ style, source, fullWidth, ...props }: ImageProps) => {
    const [layout, setLayout] = React.useState<null | LayoutRectangle>(null);
    const [imageSize, setImageSize] = React.useState<null | { width: number; height: number; }>(null);
    const [, setGetSizeError] = React.useState(null);

    React.useEffect(() => {
        RNImage.getSize( // @ts-ignore
            source?.uri || source,
            (w, h) => setImageSize({ width: w, height: h }),
            (e: any) => setGetSizeError(e)
        );
    }, [source]);

    return (
        <RNImage
            {...props}
            source={source}
            onLayout={e => setLayout(e.nativeEvent.layout)}
            style={[
                style,
                !fullWidth ? null : !(imageSize && layout) ? null : {
                    width: layout.width,
                    height: imageSize.height * (layout.width / imageSize.width)
                }
            ]}
        />
    );
};
