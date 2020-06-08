import React from 'react';
import PropTypes from 'prop-types';
import UiDropdown from '@/ui/Dropdown';

const DropDown = ({ field, onChange, value, conditionMet, }) => {
  const opts = (field.values || '').split('\n')
    .map((v = '') => v.trim())
    .filter(v => v)
    .map(v => {
      v = v.split(',');
      return { value: v[0], label: v[1] };
    });

  return (
    <>
      <UiDropdown
        enabled={conditionMet}
        value={value || ''}
        label={field.label}
        placeholder={field.label}
        onChange={v => onChange(v)}
        options={[{ value: '', label: field.label }, ...opts]}
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
