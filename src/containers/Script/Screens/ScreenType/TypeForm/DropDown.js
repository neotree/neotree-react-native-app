import React from 'react';
import PropTypes from 'prop-types';
import { Picker, Form, Icon, Item } from 'native-base';
import Text from '@/components/Text';
import DropDownInput from '@/components/DropDown';

const DropDown = ({ field, onChange, value, conditionMet, }) => {
  const pickerRef = React.useRef(null);
  const [error] = React.useState(null);

  const opts = (field.values || '').split('\n')
    .map((v = '') => v.trim())
    .filter(v => v)
    .map(v => {
      v = v.split(',');
      return { value: v[0], label: v[1] };
    });

  return (
    <>
      <Text
        style={[
          error ? { color: '#b20008' } : {},
          !conditionMet ? { color: '#999' } : {},
        ]}
      >{field.label}{field.optional ? '' : ' *'}</Text>

      <DropDownInput
        options={opts}
        value={value}
        disabled={!conditionMet}
        title="Select an option"
        onChange={v => onChange(v.value, {
          error: null,
          valueText: !v ? null : v.label,
        })}
      />
    </>
  );
};

DropDown.propTypes = {
  field: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.any,
  conditionMet: PropTypes.bool,
};

export default DropDown;
