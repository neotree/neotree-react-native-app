import React from 'react';
import PropTypes from 'prop-types';
import Typography from '@/ui/Typography';
import Divider from '@/ui/Divider';

const Entry = ({ label, values }) => { // eslint-disable-line
  return (
    <>
      <Typography>{label}</Typography>
      {values.map(v => {
        return (
          <Typography
            key={v.key}
            variant="textSecondary"
          >{v.text}</Typography>
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
