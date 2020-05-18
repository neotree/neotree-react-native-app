import React from 'react';
import PropTypes from 'prop-types';
import makeStyles from '@/ui/styles/makeStyles';
import { View } from 'react-native';
import { Picker } from '@react-native-community/picker';
import Typography from '../Typography';

const useStyles = makeStyles((theme, { enabled }) => ({
  root: {
    borderWidth: 1,
    borderColor: '#ccc',
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    marginBottom: 5,
    ...enabled ? null : { color: theme.palette.disabled },
  },
  picker: {
    flex: 1,
    padding: theme.spacing(),
    ...enabled ? null : { color: theme.palette.disabled },
  },
}));

const Dropdown = ({
  style,
  options,
  onChange,
  value,
  label,
  placeholder,
  enabled,
  ...props
}) => {
  const styles = useStyles({ enabled });

  return (
    <>
      {!label ? null : <Typography style={[styles.label]}>{label}</Typography>}

      <View
        {...props}
        style={[styles.root, ...(style ? style.map ? style : [style] : [])]}
      >
        <Picker
          enabled={enabled}
          style={[styles.picker]}
          selectedValue={value}
          onValueChange={onChange}
        >
          {options.map(opt => {
            return (
              <Picker.Item
                key={opt.value}
                value={opt.value}
                label={opt.label}
              />
            );
          })}
        </Picker>
      </View>
    </>
  );
};

Dropdown.propTypes = {
  enabled: PropTypes.bool,
  onChange: PropTypes.func,
  value: PropTypes.string,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  options: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string,
    value: PropTypes.string
  })),
  style: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
  ]),
};

export default Dropdown;
