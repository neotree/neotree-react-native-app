import React from 'react';
import PropTypes from 'prop-types';
import * as ExpoPrint from 'expo-print';
import { MaterialIcons } from '@expo/vector-icons';
import colorStyles from '@/styles/colorStyles';
import { TouchableOpacity } from 'react-native';
import formToHTML from './formToHTML';

const PrintSession = ({ session, showConfidential, }) => {
  const [, setPrinting] = React.useState(false);
  const [, setPrintingError] = React.useState(false);

  // const print = async () => {
  //   try {
  //     const { uri } = await ExpoPrint.printToFileAsync({ html: formToHTML(session, showConfidential) });
  //     if (Platform.OS === 'ios') {
  //       try { await Sharing.shareAsync(uri); } catch (e) { /* Do nothing */ }
  //     } else {
  //       let permission = null;
  //       try { permission = await MediaLibrary.requestPermissionsAsync(); } catch (e) { /* Do nothing */ }
  //       if (permission && permission.granted) {
  //         try { await MediaLibrary.createAssetAsync(uri); } catch (e) { /* Do nothing */ }
  //       }
  //     }
  //   } catch (e) { setPrintingError(e); }
  // };

  const print = () => {
    setPrinting(true);
    ExpoPrint.printAsync({ html: formToHTML(session, showConfidential) })
      .then(() => setPrinting(false))
      .catch(e => {
        setPrinting(false);
        setPrintingError(e);
      });
  };

  return (
    <>
      <TouchableOpacity
        style={{ paddingHorizontal: 10 }}
        onPress={() => print()}
      ><MaterialIcons color="black" size={24} style={[colorStyles.primaryColor]} name="print" /></TouchableOpacity>
    </>
  );
};

PrintSession.propTypes = {
  session: PropTypes.object.isRequired,
  showConfidential: PropTypes.bool,
};

export default PrintSession;