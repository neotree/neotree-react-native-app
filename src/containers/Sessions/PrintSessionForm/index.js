import React from 'react';
import PropTypes from 'prop-types';
import * as ExpoPrint from 'expo-print';
import { Icon } from 'native-base';
import colorStyles from '@/styles/colorStyles';
import { TouchableOpacity, Platform } from 'react-native';
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
import formToHTML from './formToHTML';

const PrintSessionForm = ({ session, showConfidential, }) => {
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
      ><Icon style={[colorStyles.primaryColor]} name="print" /></TouchableOpacity>
    </>
  );
};

PrintSessionForm.propTypes = {
  session: PropTypes.object.isRequired,
  showConfidential: PropTypes.bool,
};

export default PrintSessionForm;
