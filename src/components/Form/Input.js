import React from 'react';
import PropTypes from 'prop-types';
import { Input } from 'native-base';

const InputComponent = React.forwardRef(({
  style,
  placeholderTextColor,
  ...props
}, ref) => {
  return (
    <>
      <Input
        ref={ref}
        {...props}
        placeholderTextColor={placeholderTextColor || '#ccc'}
        style={[
          {},
          ...(style ? style.map ? style : [style] : [])
        ]}
      />
    </>
  );
});

InputComponent.propTypes = {
  placeholderTextColor: PropTypes.string,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

export default InputComponent;
