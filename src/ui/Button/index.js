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
  disabled,
  children,
  ...props
}) => {
  const [shadow] = React.useState({
    shadowOffsetWidth: 0,
    shadowOffsetHeight: 0,
    shadowRadius: 0,
    shadowOpacity: 0.1,
  });

  const styles = useStyles({
    color,
    variant,
    size,
    disabled,
    shadow
  });

  return (
    <>
      <TouchableOpacity
        {...props}
        disabled={disabled}
        style={[
          styles.root,
          ...(style ? style.map ? style : [style] : [])
        ]}
      >
        {typeof children !== 'string' ?
          typeof children !== 'function' ? children : children({ styles })
          :
          (
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
  disabled: PropTypes.bool,
  children: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.func,
  ]),
  size: PropTypes.oneOf(['sm', 'lg', 'xl']),
  variant: PropTypes.oneOf(['outlined', 'contained']),
  color: PropTypes.string,
  style: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
  ]),
};

export default Button;
