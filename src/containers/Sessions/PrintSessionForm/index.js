import React from 'react';
import PropTypes from 'prop-types';
import Print from '@/components/Print';
import formToHTML from './formToHTML';

const PrintSessionForm = ({ session, showConfidential, }) => {
  return (
    <>
      <Print
        options={{ html: formToHTML(session, showConfidential) }}
      />
    </>
  );
};

PrintSessionForm.propTypes = {
  session: PropTypes.object.isRequired,
  showConfidential: PropTypes.bool,
};

export default PrintSessionForm;
