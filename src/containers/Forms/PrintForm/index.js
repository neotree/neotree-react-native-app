import React from 'react';
import PropTypes from 'prop-types';
import Print from '@/components/Print';

const PrintForm = () => {
  return (
    <>
      <Print
        options={{ html: '<h1>NeoTree</h1>' }}
      />
    </>
  );
};

PrintForm.propTypes = {
  form: PropTypes.array.isRequired
};

export default PrintForm;
