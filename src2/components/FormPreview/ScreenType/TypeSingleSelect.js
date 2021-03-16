import React from 'react';
import PropTypes from 'prop-types';
import DisplayField from './_DisplayField';

const SingleSelect = ({ screen, form }) => {
  const metadata = screen.data.metadata || {};

  const value = (metadata.items || []).filter(item => `${item.id}` === `${form.form}`)[0];

  return (
    <>
      <DisplayField
        label={metadata.label}
        values={[{ text: value ? value.label : 'N/A', key: form.key }]}
      />
    </>
  );
};

SingleSelect.propTypes = {
  screen: PropTypes.object,
  form: PropTypes.object.isRequired,
};

export default SingleSelect;
