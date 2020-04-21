import React from 'react';
import PropTypes from 'prop-types';
import useTheme from '../styles/useTheme';
import { TextInput } from 'react-native';

import makeStyles from '../styles/makeStyles';
import styles from './styles';

const useStyles = makeStyles(styles);

const Input = React.forwardRef(({
  style,
  color,
  size,
  noFill,
  ...props
}, ref) => {
  const theme = useTheme();

  const [fill, setFill] = React.useState('rgba(0,0,0,.08)');

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
          if (props.onFocus) props.onFocus(e);
        }}
        onBlur={e => {
          setFocused(false);
          if (props.onBlur) props.onBlur(e);
        }}
        style={[
          styles.root,
          styles[color],
          styles[size],
          noFill || focused || props.value? styles.noFill : null,
          ...(style ? style.map ? style : [style] : [])
        ]}
      />
    </>
  );
});

Input.propTypes = {
  style: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
  ]),
  size: PropTypes.oneOf(['sm', 'xl', 'lg']),
  color: PropTypes.oneOf(['primary', 'secondary', 'error']),
};

export default Input;
