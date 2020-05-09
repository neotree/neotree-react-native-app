import React from 'react';
import PropTypes from 'prop-types';
import makeStyles from '@/ui/styles/makeStyles';
import { View, TouchableOpacity } from 'react-native';
import Typography from '../Typography';
import { useRadioGroupContext } from '../RadioGroup/Context';

const useStyles = makeStyles((theme, { checked, color }) => {
  color = color || 'primary';
  const size = 25;
  const indicatorSize = 15;

  return {
    root: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing(),
    },
    icon: {
      width: size,
      height: size,
      borderRadius: size / 2,
      borderColor: !checked ? '#999' :
        theme.palette[color] ? theme.palette[color].main : color,
      borderWidth: 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconInner: {
      width: indicatorSize,
      height: indicatorSize,
      borderRadius: indicatorSize / 2,
      ...!checked ? null : theme.palette[color] ?
        { backgroundColor: theme.palette[color].main || color } : null
    },
    label: {
      marginLeft: theme.spacing()
    },
  };
});

const Radio = props => {
  const radioCroupContext = useRadioGroupContext();

  props = { ...props, ...radioCroupContext };

  const {
    style,
    label,
    checked,
    value,
    onChange,
    color,
    name,
    ..._props
  } = props;

  const _checked = radioCroupContext ? radioCroupContext.selected === value : checked;

  const styles = useStyles({ checked: _checked, color });

  return (
    <TouchableOpacity
      {..._props}
      onPress={() => {
        if (onChange) {
          onChange({
            value,
            name,
            checked: true
          });
        }
      }}
      style={[styles.root, ...(style ? style.map ? style : [style] : [])]}
    >
      <>
        <View
          style={[styles.icon]}
        >
          {!_checked ? null : <View style={[styles.iconInner]} />}
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

Radio.propTypes = {
  name: PropTypes.string,
  onChange: PropTypes.func,
  label: PropTypes.string,
  checked: PropTypes.bool,
  value: PropTypes.string,
  color: PropTypes.oneOf(['primary', 'secondary']),
  style: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
  ]),
};

export default Radio;
