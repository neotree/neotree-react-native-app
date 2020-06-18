import React from 'react';
import { useSessionsContext } from '@/contexts/sessions';
import { useHistory } from 'react-router-native';
import useBackButton from '@/utils/useBackButton';
import { View } from 'react-native';
import { Header, Body, Left, Title, Right, Button, Icon, CheckBox, Content } from 'native-base';

import ExportLink from './ExportLink';
import DeleteBtn from './DeleteBtn';
import ToggleSelect from './ToggleSelect';

const HeaderComponent = () => {
  const history = useHistory();
  const { state: { sessions, selectedItems, canSelectItems }, selectItems } = useSessionsContext();

  const goBack = () => {
    history.entries = [];
    history.push('/');
  };

  useBackButton(() => { goBack(); }, []);

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
          <Title>Session history</Title>
        </Body>

        <Right>
          <ExportLink />
          <ToggleSelect />
        </Right>
      </Header>

      {canSelectItems && (
        <>
          <View style={{ height: 50 }}>
            <Content padder contentContainerStyle={[{ flexDirection: 'row', alignItems: 'center' }]}>
              <View style={{ marginRight: 20 }}>
                <CheckBox
                  color="blue"
                  checked={selectedItems.length === sessions.length}
                  onPress={() => selectItems(selectedItems.length ? selectedItems : sessions.map(item => item.id))}
                />
              </View>

              <View style={{ marginRight: 20 }}>
                <DeleteBtn />
              </View>
            </Content>
          </View>
        </>
      )}
    </>
  );
};

export default HeaderComponent;
