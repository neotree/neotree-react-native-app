import React from 'react';
import { useHistory } from 'react-router-native';
import useBackButton from '@/utils/useBackButton';
import { Header, Body, Left, Title, Right, Button, Icon } from 'native-base';

const HeaderComponent = () => {
  const history = useHistory();

  const goBack = () => {
    history.entries = [];
    history.push('/sessions');
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
          <Title>Export</Title>
        </Body>

        <Right />
      </Header>
    </>
  );
};

export default HeaderComponent;
