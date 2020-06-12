import React from 'react';
import PropTypes from 'prop-types';
import makeStyles from '@/ui/styles/makeStyles';
import { View, TouchableOpacity } from 'react-native';
import Typography from '../Typography';
import Icon from '../Icon';

const useStyles = makeStyles((theme, { checked, color, variant }) => {
  color = color || 'primary';
  const size = 25;

  return {
    root: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: theme.spacing(),
      ...variant !== 'outlined' ? null : {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: theme.spacing(2),
      },
    },
    iconBox: {
      width: size,
      height: size,
      borderColor: !checked ? '#999' :
        theme.palette[color] ? theme.palette[color].main : color,
      borderWidth: 2,
      alignItems: 'center',
      justifyContent: 'center',
      ...!checked ? null : theme.palette[color] ?
        { backgroundColor: theme.palette[color].main || color } : null
    },
    icon: {
      fontSize: size * 0.8,
      color: theme.palette[color] ? theme.palette[color].text : '#fff',
    },
    label: {
      marginLeft: theme.spacing(),
    },
  };
});

const Checkbox = ({
  style,
  label,
  checked,
  value,
  onChange,
  color,
  name,
  variant,
  ..._props
}) => {
  const styles = useStyles({ checked, color, variant });

  return (
    <TouchableOpacity
      {..._props}
      onPress={() => {
        if (onChange) {
          onChange({
            value,
            name,
            checked: !checked
          });
        }
      }}
      style={[styles.root, ...(style ? style.map ? style : [style] : [])]}
    >
      <>
        <View
          style={[styles.iconBox]}
        >
          {checked && <Icon name="md-checkmark" style={[styles.icon]} />}
        </View>

        {!label ? null : (
          <Typography
            style={[styles.label]}
          >{label}</Typography>
        )}
      </>
    </TouchableOpacity>
  );
};

Checkbox.propTypes = {
  name: PropTypes.string,
  onChange: PropTypes.func,
  label: PropTypes.string,
  checked: PropTypes.bool,
  value: PropTypes.string,
  variant: PropTypes.oneOf(['outlined']),
  color: PropTypes.oneOf(['primary', 'secondary']),
  style: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
  ]),
};

export default Checkbox;
