import React from 'react';
import PropTypes from 'prop-types';
import PlainText from './PlainText';
import NUID from './NUID';

const FieldText = props => {
  const { field } = props;
  const isNeotreeID = field.key.match('UID') || field.key.match('NUID_') ||
    field.key.match(new RegExp('neotree', 'gi'));

  return (
    <>
      {isNeotreeID ?
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
