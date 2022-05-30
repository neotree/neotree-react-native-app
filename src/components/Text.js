import React from 'react';
import PropTypes from 'prop-types';
import { Text } from 'native-base';

const styles = {
  root: {
    fontSize: 18,
  },
  h1: {
    fontSize: 40,
    fontWeight: 'bold',
  },
  h2: {
    fontSize: 35,
    fontWeight: 'bold',
  },
  h3: {
    fontSize: 30,
    fontWeight: 'bold',
  },
  h4: {
    fontSize: 25,
    fontWeight: 'bold',
  },
  h5: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  caption: {
    fontSize: 15,
  },
};

const TextComponent = ({ style, variant, ...props }) => {
  return (
    <>
      <Text
        style={[
          styles.root,
          styles[variant],
          ...(style ? style.map ? style : [style] : [])
        ]}
        {...props}
      />
    </>
  );
};

TextComponent.propTypes = {
  children: PropTypes.node,
  variant: PropTypes.oneOf(['h1', 'h2', 'h3', 'h4', 'h5', 'caption']),
  style: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
  ]),
};

export default TextComponent;
