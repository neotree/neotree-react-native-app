import React from 'react';
import PropTypes from 'prop-types';
import UiDropdown from '@/ui/Dropdown';

const DropDown = ({ field }) => {
  return (
    <>
      <UiDropdown
        value=""
        label={field.label}
        placeholder={field.label}
        options={[]}
      />
    </>
  );
};

DropDown.propTypes = {
  field: PropTypes.object.isRequired
};

export default DropDown;
