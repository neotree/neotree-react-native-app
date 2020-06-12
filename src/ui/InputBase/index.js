import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import makeStyles from '../styles/makeStyles';
import styles from './styles';

const useStyles = makeStyles(styles);

const InputBase = React.forwardRef(({
  children,
  Input,
  inputProps,
  variant,
  color,
  size,
  editable,
  ...props
}, ref) => {
  inputProps = inputProps || {};

  const styles = useStyles({
    variant,
    color,
    size,
    editable,
  });

  inputProps = {
    style: [
      styles.input,
      ...(inputProps.style ? inputProps.style.map ? inputProps.style : [inputProps.style] : [])
    ]
  };

  return (
    <>
      <View
        {...props}
        style={[styles.root]}
      >
        {children}
        {Input && (
          <Input
            ref={ref}
            {...inputProps}
          />
        )}
      </View>
    </>
  );
});

InputBase.propTypes = {
  children: PropTypes.node,
  inputProps: PropTypes.object,
  Input: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.object,
  ]),
  editable: PropTypes.bool,
  size: PropTypes.oneOf(['sm', 'xl', 'lg']),
  color: PropTypes.oneOf(['primary', 'secondary', 'error']),
  variant: PropTypes.oneOf(['contained', 'outlined']),
};

export default InputBase;
