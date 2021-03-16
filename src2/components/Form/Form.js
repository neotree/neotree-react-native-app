import React from 'react';
import PropTypes from 'prop-types';
import { Form } from 'native-base';

const FormComponent = React.forwardRef(({ style, ...props }, ref) => {
  return (
    <>
      <Form
        ref={ref}
        {...props}
        style={[
          {},
          ...(style ? style.map ? style : [style] : [])
        ]}
      />
    </>
  );
});

FormComponent.propTypes = {
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

export default FormComponent;
