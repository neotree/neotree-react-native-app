import React from 'react';
import PropTypes from 'prop-types';
import UiDropdown from '@/ui/Dropdown';

const DropDown = ({ field }) => {
  const opts = (field.values || '').split('\n').map(v => {
    v = v.split(',');
    return { value: v[0], label: v[1] };
  });

  return (
    <>
      <UiDropdown
        value=""
        label={field.label}
        placeholder={field.label}
        options={opts}
      />
    </>
  );
};

DropDown.propTypes = {
  field: PropTypes.object.isRequired
};

export default DropDown;
