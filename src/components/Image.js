import React from 'react';
import PropTypes from 'prop-types';
import { Image } from 'react-native';
import makeStyles from '@/ui/styles/makeStyles';

const useStyles = makeStyles(() => ({
  image: {}
}));

const CustomImage = ({ style, source, fullWidth, ...props }) => {
  const styles = useStyles();

  const [layout, setLayout] = React.useState(null);
  const [imageSize, setImageSize] = React.useState(null);
  const [getSizeError, setGetSizeError] = React.useState(null);

  React.useEffect(() => {
    if (source) {
      Image.getSize(
        source.uri || source,
        (w, h) => setImageSize({ width: w, height: h }),
        e => setGetSizeError(e)
      );
    }
  }, [source]);

  return (
    <Image
      {...props}
      source={source}
      onLayout={e => setLayout(e.nativeEvent.layout)}
      style={[
        styles.image,

        ...(typeof style === 'function' ?
          [style({ imageSize: layout ? imageSize : null, layout, getSizeError })]
          :
          style && style.map ? style : [style]),

        !fullWidth ? null : !(imageSize && layout) ? null : {
          width: layout.width,
          height: imageSize.height * (layout.width / imageSize.width)
        }
      ]}
    />
  );
};

CustomImage.propTypes = {
  fullWidth: PropTypes.bool,
  style: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
    PropTypes.func,
  ]),
  source: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({
      uri: PropTypes.string.isRequired
    })
  ]).isRequired
};

export default CustomImage;
