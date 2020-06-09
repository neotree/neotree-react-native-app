import React from 'react';
import PropTypes from 'prop-types';
import * as ExpoPrint from 'expo-print';
import IconButton from '@/ui/IconButton';

const Print = ({ options }) => {
  const [, setPrinting] = React.useState(false);
  const [, setPrintingError] = React.useState(false);

  const print = () => {
    setPrinting(true);
    ExpoPrint.printAsync(options)
      .then(() => setPrinting(false))
      .catch(e => {
        setPrinting(false);
        setPrintingError(e);
      });
  };

  return (
    <>
      <IconButton
        color="primary"
        onPress={() => print()}
        icon="md-print"
      />
    </>
  );
};

Print.propTypes = {
  options: PropTypes.object.isRequired
};

export default Print;
