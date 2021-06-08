import React from 'react';
import PropTypes from 'prop-types';
import PlainText from './PlainText';
import NUID from './NUID';

const FieldText = props => {
  const { autoFill, value, onChange, conditionMet } = props;
  const [defaultValue, setDefaultValue] = React.useState(autoFill.uid);
  const { field } = props;
  const isNeotreeID = field.key.match('UID') || field.key.match('NUID_') ||
    field.key.match(new RegExp('neotree', 'gi'));

  React.useEffect(() => setDefaultValue(autoFill.uid), [autoFill]);

  return (
    <>
      {isNeotreeID ? (
        <NUID
          {...props}
          value={conditionMet ? value || defaultValue : null}
          onChange={(...args) => {
            if (defaultValue) setDefaultValue(null);
            onChange(...args);
          }}
        />
      ) : <PlainText {...props} />}
    </>
  );
};

FieldText.propTypes = {
  field: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.any,
  conditionMet: PropTypes.bool,
  autoFill: PropTypes.shape({
    uid: PropTypes.string,
    session: PropTypes.object,
  }),
};

export default FieldText;
