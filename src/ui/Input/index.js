import React from 'react';
import PropTypes from 'prop-types';
import { TextInput } from 'react-native';

import makeStyles from '../styles/makeStyles';
import styles from './styles';

const useStyles = makeStyles(styles);

const Input = React.forwardRef(({
  style,
  color,
  size,
  noFill,
  onFocus,
  onBlur,
  value,
  ...props
}, ref) => {
  const [focused, setFocused] = React.useState(false);

  const styles = useStyles({
    color,
  });

  return (
    <>
      <TextInput
        {...props}
        ref={ref}
        onFocus={e => {
          setFocused(true);
          if (props.onFocus) onFocus(e);
        }}
        onBlur={e => {
          setFocused(false);
          if (props.onBlur) onBlur(e);
        }}
        style={[
          styles.root,
          styles[color],
          styles[size],
          noFill || focused || value ? styles.noFill : null,
          ...(style ? style.map ? style : [style] : [])
        ]}
      />
    </>
  );
});

Input.propTypes = {
  noFill: PropTypes.bool,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  value: PropTypes.string,
  style: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
  ]),
  size: PropTypes.oneOf(['sm', 'xl', 'lg']),
  color: PropTypes.oneOf(['primary', 'secondary', 'error']),
};

export default Input;
