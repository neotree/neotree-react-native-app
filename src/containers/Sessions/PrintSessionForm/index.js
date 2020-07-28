import React from 'react';
import PropTypes from 'prop-types';
import Print from '@/components/Print';
import formToHTML from './formToHTML';

const PrintSessionForm = ({ session }) => {
  return (
    <>
      <Print
        options={{ html: formToHTML(session) }}
      />
    </>
  );
};

PrintSessionForm.propTypes = {
  session: PropTypes.object.isRequired
};

export default PrintSessionForm;
