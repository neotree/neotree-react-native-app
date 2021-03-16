import React from 'react';
import PropTypes from 'prop-types';
import DisplayField from './_DisplayField';

const Timer = ({ screen, form }) => {
  const metadata = screen.data.metadata || {};

  return (
    <>
      <DisplayField
        label={metadata.label}
        values={[{ text: form.form || 'N/A', key: form.key }]}
      />
    </>
  );
};

Timer.propTypes = {
  screen: PropTypes.object,
  form: PropTypes.object.isRequired,
};

export default Timer;
