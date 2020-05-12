import React from 'react';
import PropTypes from 'prop-types';
import makeStyles from '@/ui/styles/makeStyles';
import { View, Picker } from 'react-native';
import Typography from '../Typography';

const useStyles = makeStyles((theme) => ({
  root: {
    borderWidth: 1,
    borderColor: '#ccc',
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    marginBottom: 5,
  },
  picker: {
    flex: 1,
    padding: theme.spacing(),
  },
}));

const Dropdown = ({
  style,
  options,
  onChange,
  value,
  label,
  placeholder,
  ...props
}) => {
  const styles = useStyles();

  return (
    <>
      {!label ? null : <Typography style={[styles.label]}>{label}</Typography>}

      <View
        {...props}
        style={[styles.root, ...(style ? style.map ? style : [style] : [])]}
      >
        <Picker
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
