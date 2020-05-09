import React from 'react';
import PropTypes from 'prop-types';
import { TextInput } from 'react-native';
import Typography from '../Typography';
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
  label,
  variant,
  ...props
}, ref) => {
  variant = variant || 'outlined';

  const [focused, setFocused] = React.useState(false);

  const styles = useStyles({
    size,
    color,
    focused,
    value,
    variant,
  });

  return (
    <>
      {!label ? null : (
        <Typography
          style={[styles.label]}
          // variant="caption"
          color={color}
        >
          {label}
        </Typography>
      )}
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
  label: PropTypes.string,
  style: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
  ]),
  size: PropTypes.oneOf(['sm', 'xl', 'lg']),
  color: PropTypes.oneOf(['primary', 'secondary', 'error']),
  variant: PropTypes.oneOf(['contained', 'outlined']),
};

export default Input;
