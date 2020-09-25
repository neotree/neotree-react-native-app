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
  const { pathname: currentLink } = useLocation();
  const { state: { script } } = useScriptContext();
  const { getScreenLink, saveForm, state: { activeScreen } } = useScreensContext();
  const backLink = getScreenLink('back');

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
            saveForm({ canceled: true, saveInBackground: true, });
            history.push('/');
          }
        }
      ],
      { cancelable: false }
    );
  };

  useBackButton(() => {
    history.entries = [];
    history.push(backLink || currentLink);
    if (!backLink) cancelScript();
  });

  const [openInfoModal, setOpenInfoModal] = React.useState(false);

  return (
    <>
      <Header
        title={activeScreen ? activeScreen.data.title : null}
        subtitle={script.data.title}
        leftActions={(
          <>
            <Link
              transparent
              component={TouchableOpacity}
              to={backLink || currentLink}
              onPress={() => !backLink && cancelScript()}
            >
              <Icon style={[colorStyles.primaryColor]} name="arrow-back" />
            </Link>
          </>
        )}
        rightActions={(
          <>
            {activeScreen && !!activeScreen.data.infoText && (
              <>
                <TouchableOpacity
                  onPress={() => setOpenInfoModal(true)}
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
