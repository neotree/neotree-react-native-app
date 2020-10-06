import React from 'react';
import { useScriptContext } from '@/contexts/script';
import { useScreensContext } from '@/contexts/screens';
import { useHistory, useLocation, Link } from 'react-router-native';
import useBackButton from '@/utils/useBackButton';
import copy from '@/constants/copy';
import scriptPageCopy from '@/constants/copy/scriptPage';
import { Icon, ActionSheet } from 'native-base';
import { Alert, TouchableOpacity, Platform, } from 'react-native';
import Modal from '@/components/Modal';
import Text from '@/components/Text';
import Divider from '@/components/Divider';
import Header from '@/components/Header';
import colorStyles from '@/styles/colorStyles';

const HeaderComponent = () => {
  const history = useHistory();
  const { state: { script } } = useScriptContext();
  const { goToScreen, saveForm, state: { activeScreen, activeScreenIndex, } } = useScreensContext();

  const cancelScript = () => {
    Alert.alert(
      scriptPageCopy.CONFIRM_CANCELING_SCRIPT_TITLE,
      scriptPageCopy.CONFIRM_CANCELING_SCRIPT_MESSAGE,
      [
        {
          text: copy.ALERT_CANCEL,
          onPress: () => {},
          style: 'cancel'
        },
        {
          text: copy.ALERT_OK,
          onPress: () => {
            saveForm({ canceled: true, });
            history.push('/');
          }
        }
      ],
      { cancelable: false }
    );
  };

  useBackButton(() => {
    if (activeScreenIndex < 1) return cancelScript();
    goToScreen('back');
  });

  const [openInfoModal, setOpenInfoModal] = React.useState(false);

  return (
    <>
      <Header
        title={activeScreen ? activeScreen.data.title : null}
        subtitle={script.data.title}
        leftActions={(
          <>
            <TouchableOpacity
              onPress={() => {
                if (activeScreenIndex < 1) return cancelScript();
                goToScreen('back');
              }}
            >
              <Icon style={[colorStyles.primaryColor]} name="arrow-back" />
            </TouchableOpacity>
          </>
        )}
        rightActions={(
          <>
            {activeScreen && !!activeScreen.data.infoText && (
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

      {!!activeScreen && (
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
          <Text note>{activeScreen.data.infoText}</Text>
        </Modal>
      )}
    </>
  );
};

export default HeaderComponent;
