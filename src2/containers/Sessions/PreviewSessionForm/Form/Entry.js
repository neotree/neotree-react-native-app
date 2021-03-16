import React from 'react';
import PropTypes from 'prop-types';
import Divider from '@/components/Divider';
import Text from '@/components/Text';

const Entry = ({ label, values }) => { // eslint-disable-line
  return (
    <>
      <Text>{label}</Text>
      {values.map((v, i) => {
        const key = i;
        return (
          <Text
            key={key}
            style={{ color: '#999' }}
          >{v.valueText || v.value || 'N/A'}</Text>
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
