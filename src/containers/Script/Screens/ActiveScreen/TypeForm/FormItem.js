import React from 'react';
import PropTypes from 'prop-types';

const FormItem = ({ onChange, setCache, value, valueCache, children, conditionMet }) => {
  const ref = React.useRef({ mounted: false });

  React.useEffect(() => {
    if (!conditionMet) {
      setCache(value);
      onChange(null);
    } else {
      onChange(valueCache);
    }
  }, [conditionMet]);

  React.useEffect(() => { ref.current.mounted = true; }, []);

  if (!ref.current.mounted) return null;

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
