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
          >{v.text}</Text>
        );
      })}
      <Divider spacing={2} />
    </>
  );
};

Entry.propTypes = {
  label: PropTypes.string,
  values: PropTypes.arrayOf(PropTypes.shape({
    text: PropTypes.string,
    key: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
  }))
};

export default Entry;
