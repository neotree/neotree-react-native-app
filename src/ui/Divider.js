import React from 'react';
import PropTypes from 'prop-types';
import makeStyles from '@/ui/styles/makeStyles';

import { View } from 'react-native';

const useStyles = makeStyles((theme, { spacing, border }) => ({
  root: {
    marginVertical: theme.spacing(spacing),
    backgroundColor: border === false ? 'transparent' : '#ddd',
    height: 1,
  }
}));

const Divider = ({ style, border, spacing, ...props }) => {
  const styles = useStyles({ spacing, border });

  return (
    <View
      {...props}
      style={[styles.root, ...(style ? style.map ? style : [style] : [])]}
    />
  );
};

Divider.propTypes = {
  spacing: PropTypes.number,
  border: PropTypes.bool,
  style: PropTypes.oneOfType([
    PropTypes.shape,
    PropTypes.object,
  ]),
};

export default Divider;
