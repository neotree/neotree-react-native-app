import React from 'react';
import PropTypes from 'prop-types';

import { TouchableOpacity, Text } from 'react-native';

import makeStyles from '../styles/makeStyles';
import styles from './styles';

const useStyles = makeStyles(styles);

const Button = ({
  style,
  color,
  variant,
  size,
  children,
  ...props
}) => {
  const styles = useStyles({
    color,
    variant,
    size,
    disabled: props.disabled
  });

  return (
    <>
      <TouchableOpacity
        {...props}
        style={[
          styles.root,
          ...(style ? style.map ? style : [style] : [])
        ]}
      >
        {typeof children !== 'string' ? children : (
          <Text
            style={[
              styles.text,
              styles[`${color}Text`]
            ]}
          >{children}</Text>
        )}
      </TouchableOpacity>
    </>
  );
};

Button.propTypes = {
  children: PropTypes.node,
  size: PropTypes.oneOf(['sm', 'lg', 'xl']),
  variant: PropTypes.oneOf(['outlined', 'contained']),
  color: PropTypes.oneOf(['primary', 'secondary', 'disabled', 'error', 'success']),
  style: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
  ]),
};

export default Button;
