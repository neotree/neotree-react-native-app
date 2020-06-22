import React from 'react';
import PropTypes from 'prop-types';
import PlainText from './PlainText';
import NUID from './NUID';

const FieldText = props => {
  const { field } = props;

  return (
    <>
      {field.type.match('NUID_') ?
        <NUID {...props} />
        :
        <PlainText {...props} />}
    </>
  );
};

FieldText.propTypes = {
  field: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.any,
  conditionMet: PropTypes.bool,
};

export default FieldText;
