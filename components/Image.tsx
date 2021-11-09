import React from 'react';
import PropTypes from 'prop-types';
import { Image as RNImage, ImageProps as RNImageProps, LayoutRectangle, StyleProp } from 'react-native';

export type ImageProps = RNImageProps & {
    fullWidth?: boolean;
}

export const Image = React.forwardRef<RNImage, ImageProps>(({ style, source, fullWidth, ...props }, ref) => {
  const mounted = React.useRef(false);
  const [layout, setLayout] = React.useState(null);
  const [imageSize, setImageSize] = React.useState(null);
  const [getSizeError, setGetSizeError] = React.useState(null);

  React.useEffect(() => {
    mounted.current = true;
    return () => mounted.current = false;
  }, []);

  React.useEffect(() => {
    if (source) {
        RNImage.getSize(
            // @ts-ignore
            source.uri || source,
            (w, h) => mounted.current && setImageSize({ width: w, height: h }),
            e => setGetSizeError(e)
        );
    }
  }, [source]);

  return (
    <RNImage
      {...props}
      ref={ref}
      source={source}
      onLayout={e => setLayout(e.nativeEvent.layout)}
      style={[
        !fullWidth ? null : !(imageSize && layout) ? null : {
          width: layout.width,
          height: imageSize.height * (layout.width / imageSize.width)
        },
        style
      ]}
    />
  );
});
