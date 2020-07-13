import React from 'react';
import { useScriptContext } from '@/contexts/script';
import { useScreensContext } from '@/contexts/screens';
import { useHistory } from 'react-router-native';
import useBackButton from '@/utils/useBackButton';
import copy from '@/constants/copy';
import scriptPageCopy from '@/constants/copy/scriptPage';
import { Header, Body, Title, Left, Button, Icon, Right, ActionSheet } from 'native-base';
import { Alert } from 'react-native';

const HeaderComponent = () => {
  const history = useHistory();
  const { state: { script } } = useScriptContext();
  const { saveForm } = useScreensContext();

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

  const goBack = () => {
    const currentIndex = history.entries.length - 1;
    const lastIndex = currentIndex - 1;
    if (lastIndex) {
      history.go(lastIndex);
      history.entries = history.entries.filter((e, i) => i !== currentIndex);
    } else {
      cancelScript();
    }
  };

  useBackButton(() => { goBack(); });

  return (
    <>
      <Header>
        <Left style={{ maxWidth: 50 }}>
          <Button
            transparent
            onPress={() => goBack()}
          >
            <Icon name="arrow-back" />
          </Button>
        </Left>

        <Body>
          <Title>{script.data.title}</Title>
        </Body>

        <Right style={{ maxWidth: 50 }}>
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
    </>
  );
};

export default HeaderComponent;
