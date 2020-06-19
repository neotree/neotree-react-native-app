import React from 'react';
import PropTypes from 'prop-types';
import { CheckBox } from 'native-base';

const CheckBoxComponent = ({ style, ...props }) => {
  return (
    <>
      <CheckBox
        style={[
          ...(style ? style.map ? style : [style] : [])
        ]}
        {...props}
      />
    </>
  );
};

CheckBoxComponent.propTypes = {
  children: PropTypes.node,
  style: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
  ]),
};

export default CheckBoxComponent;
