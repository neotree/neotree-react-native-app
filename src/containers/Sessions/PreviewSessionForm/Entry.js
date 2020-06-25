import React from 'react';
import PropTypes from 'prop-types';
import Divider from '@/components/Divider';
import Text from '@/components/Text';

const Entry = ({ label, values }) => { // eslint-disable-line
  return (
    <>
      <Text>{label}</Text>
      {values.map(v => {
        return (
          <Text
            key={v.key}
            style={{ color: '#999' }}
          >{v.text || v.valueText || v.label || v.value}</Text>
        );
      })}
      <Divider spacing={2} />
    </>
  );
};

Entry.propTypes = {
  label: PropTypes.string,
  values: PropTypes.array,
};

export default Entry;
