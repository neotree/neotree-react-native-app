import React from 'react';
import PropTypes from 'prop-types';
import Print from '@/components/Print';
import formToHTML from './formToHTML';

const PrintSessionForm = ({ form }) => {
  return (
    <>
      <Print
        options={{ html: formToHTML(form) }}
      />
    </>
  );
};

PrintSessionForm.propTypes = {
  form: PropTypes.array.isRequired
};

export default PrintSessionForm;
