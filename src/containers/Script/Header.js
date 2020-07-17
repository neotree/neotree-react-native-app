import React from 'react';
import { useScriptContext } from '@/contexts/script';
import { useScreensContext } from '@/contexts/screens';
import { useHistory, useLocation, Link } from 'react-router-native';
import useBackButton from '@/utils/useBackButton';
import copy from '@/constants/copy';
import scriptPageCopy from '@/constants/copy/scriptPage';
import { Header, Body, Title, Left, Button, Icon, Right, ActionSheet } from 'native-base';
import { Alert, TouchableOpacity } from 'react-native';
import Modal from '@/components/Modal';
import Text from '@/components/Text';
import Divider from '@/components/Divider';

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
      <Header>
        <Left style={{ maxWidth: 50 }}>
          <Link
            transparent
            component={TouchableOpacity}
            to={backLink || currentLink}
            onPress={() => !backLink && cancelScript()}
          >
            <Icon style={{ color: '#fff' }} name="arrow-back" />
          </Link>
        </Left>

        <Body>
          <Title>{activeScreen ? activeScreen.data.title : null}</Title>
          <Text style={{ fontSize: 10, color: '#ddd' }}>{script.data.title}</Text>
        </Body>

        <Right style={{ maxWidth: 80 }}>
          {activeScreen && !!activeScreen.data.infoText && (
            <Button
              transparent
              onPress={() => setOpenInfoModal(true)}
            >
              <Icon name="information-circle-outline" />
            </Button>
          )}

          <Button
            transparent
            onPress={() => {
              ActionSheet.show(
                {
                  options: ['Cancel Script?'],
                  title: 'Action',
                  // cancelButtonIndex: 1,
                },
                i => i === 0 && cancelScript()
              );
            }}
          >
            <Icon name="more" />
          </Button>
        </Right>
      </Header>

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
