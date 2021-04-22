import React from 'react';
import PropTypes from 'prop-types';
import * as ExpoPrint from 'expo-print';
import { MaterialIcons } from '@expo/vector-icons';
import colorStyles from '@/styles/colorStyles';
import { TouchableOpacity } from 'react-native';

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
      <TouchableOpacity
        onPress={() => print()}
      ><MaterialIcons color="black" size={24} style={[colorStyles.primaryColor]} name="print" /></TouchableOpacity>
    </>
  );
};

Print.propTypes = {
  options: PropTypes.object.isRequired
};

export default Print;
