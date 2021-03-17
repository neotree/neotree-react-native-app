import React from 'react';
import PropTypes from 'prop-types';

const FormItem = ({ onChange, setCache, value, valueCache, children, conditionMet }) => {
  React.useEffect(() => {
    if (!conditionMet) {
      setCache(value);
      onChange(null);
    } else {
      onChange(valueCache);
    }
  }, [conditionMet]);

  return (
    <>
      {children}
    </>
  );
};

FormItem.propTypes = {
  children: PropTypes.node,
  setCache: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  valueCache: PropTypes.any,
  value: PropTypes.any,
  conditionMet: PropTypes.bool,
};

export default FormItem;
