import React from 'react';
import PropTypes from 'prop-types';
import Print from '@/components/Print';
import formToHTML from './formToHTML';

const PrintForm = ({ form }) => {
  return (
    <>
      <Print
        options={{ html: formToHTML(form) }}
      />
    </>
  );
};

PrintForm.propTypes = {
  form: PropTypes.array.isRequired
};

export default PrintForm;
