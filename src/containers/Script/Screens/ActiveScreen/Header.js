import React from 'react';
import PropTypes from 'prop-types';
import { Alert, Platform, TouchableOpacity } from 'react-native';
import { ActionSheet, Icon } from 'native-base';
import { useHistory, } from 'react-router-native';
import useBackButton from '@/utils/useBackButton';
import Modal from '@/components/Modal';
import Text from '@/components/Text';
import Divider from '@/components/Divider';
import Header from '@/components/Header';
import colorStyles from '@/styles/colorStyles';

const ScreenHeader = ({
  screen,
  activeScreenIndex,
  script,
  getScreen,
  saveSession,
  setActiveScreen,
}) => {
  const history = useHistory();

  const cancelScript = () => {
    Alert.alert(
      'Cancel script',
      'Are you sure you want to cancel script?',
      [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel'
        },
        {
          text: 'Ok',
          onPress: () => {
            saveSession({ canceled: true, });
            history.push('/');
          }
        }
      ],
      { cancelable: false }
    );
  };

  const onBack = () => {
    if (activeScreenIndex < 1) return cancelScript();
    const prev = getScreen({ direction: 'back' });
    setActiveScreen(prev ? prev.screen : null);
  }

  useBackButton(() => { onBack(); });

  const [openInfoModal, setOpenInfoModal] = React.useState(false);

  return (
    <>
      <Header
        title={screen.data.title}
        subtitle={script.data.title}
        leftActions={(
          <>
            <TouchableOpacity
              style={{ padding: 10 }}
              onPress={() => onBack()}
            >
              <Icon style={[colorStyles.primaryColor]} name="arrow-back" />
            </TouchableOpacity>
          </>
        )}
        rightActions={(
          <>
            {!!screen.data.infoText && (
              <>
                <TouchableOpacity
                  onPress={() => setOpenInfoModal(true)}
                  style={{ padding: 10 }}
                >
                  <Icon style={[colorStyles.primaryColor]} name="information-circle-outline" />
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity
              style={{ padding: 10 }}
              onPress={() => {
                ActionSheet.show(
                  {
                    options: [
                      'Cancel Script?',
                      Platform.OS === 'ios' ? 'Close' : null
                    ].filter(o => o),
                    title: 'Action',
                    cancelButtonIndex: 1,
                  },
                  i => {
                    if (i === 0) cancelScript();
                    if (i === 1) setOpenInfoModal(false);
                  }
                );
              }}
            >
              <Icon style={[colorStyles.primaryColor]} name="more" />
            </TouchableOpacity>
          </>
        )}
      />

      {!!screen && (
        <Modal
          open={openInfoModal}
          onClose={() => setOpenInfoModal(false)}
          style={{
            width: '100%',
            height: '100%',
            // alignItems: 'center',
            // justifyContent: 'center'
          }}
        >
          <Text>Screen info</Text>
          <Divider border={false} />
          <Text note>{screen.data.infoText}</Text>
        </Modal>
      )}
    </>
  );
};

ScreenHeader.propTypes = {
  screen: PropTypes.object.isRequired,
  activeScreenIndex: PropTypes.number.isRequired,
  script: PropTypes.object.isRequired,
  getScreen: PropTypes.func.isRequired,
  saveSession: PropTypes.func.isRequired,
  setActiveScreen: PropTypes.func.isRequired,
};

export default ScreenHeader;
