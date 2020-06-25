import React from 'react';
import PropTypes from 'prop-types';
import { CheckBox } from 'native-base';

const CheckBoxComponent = ({ style, checked, ...props }) => {
  return (
    <>
      <CheckBox
        color="blue"
        checked={checked}
        style={[
          checked ? null : { borderColor: '#ccc', color: '#ccc' },
          ...(style ? style.map ? style : [style] : [])
        ]}
        {...props}
      />
    </>
  );
};

CheckBoxComponent.propTypes = {
  children: PropTypes.node,
  checked: PropTypes.bool,
  style: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
  ]),
};

export default CheckBoxComponent;
