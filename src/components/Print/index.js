import React from 'react';
import PropTypes from 'prop-types';
import * as ExpoPrint from 'expo-print';
import { Button, Icon } from 'native-base';

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
      <Button
        transparent
        onPress={() => print()}
      ><Icon name="print" /></Button>
    </>
  );
};

Print.propTypes = {
  options: PropTypes.object.isRequired
};

export default Print;
