import React from 'react';
import PropTypes from 'prop-types';
import { ActivityIndicator as Loader } from 'react-native';
import useTheme from '../styles/useTheme';

const ActivityIndicator = ({ color, size, ...props }) => {
  const theme = useTheme();
  color = color || 'primary';

  return (
    <>
      <Loader
        animating
        {...props}
        size={size || 'small'}
        color={theme.palette[color] ? theme.palette[color].main : color}
      />
    </>
  );
};

ActivityIndicator.propTypes = {
  color: PropTypes.string,
  size: PropTypes.oneOfType([
    PropTypes.oneOf(['small', 'large']),
    PropTypes.number,
  ]),
};

export default ActivityIndicator;
