import React from 'react';
import PropTypes from 'prop-types';
import { Text } from 'native-base';

const Period = ({ field, onChange, value }) => {
  return (
    <>
      <Text>{field.dataType}</Text>
    </>
  );
};

Period.propTypes = {
  field: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.any,
  enabled: PropTypes.bool,
};

export default Period;
