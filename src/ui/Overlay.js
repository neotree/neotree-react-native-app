import React from 'react';
import PropTypes from 'prop-types';
import makeStyles from '@/ui/styles/makeStyles';

import { View } from 'react-native';

const useStyles = makeStyles((theme, { color }) => {
  color = color || 'rgba(0,0,0,.5)';

  const backgroundColor = theme.palette[color] ? theme.palette[color].main : color;

  return {
    root: {
      backgroundColor,
      flex: 1,
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
    }
  };
});

const Overlay = ({ style, color, ...props }) => {
  const styles = useStyles({ color });

  return (
    <View
      {...props}
      style={[styles.root, ...(style ? style.map ? style : [style] : [])]}
    />
  );
};

Overlay.propTypes = {
  color: PropTypes.string,
  style: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
  ]),
};

export default Overlay;
