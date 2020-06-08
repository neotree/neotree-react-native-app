import React from 'react';
import PropTypes from 'prop-types';
import DisplayField from './_DisplayField';

const MultiSelect = ({ screen, form }) => {
  const metadata = screen.data.metadata || {};

  const items = metadata.items || [];

  const values = (form.form || []).map(v => v.value).map(id => items.filter(item => item.id === id)[0])
    .filter(v => v)
    .map(v => ({ key: v.id, text: v.label }));

  return (
    <>
      <DisplayField
        label={metadata.label}
        values={values}
      />
    </>
  );
};

MultiSelect.propTypes = {
  screen: PropTypes.object,
  form: PropTypes.object.isRequired,
};

export default MultiSelect;
