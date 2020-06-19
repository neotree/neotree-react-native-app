import React from 'react';
import { useHistory } from 'react-router-native';
import useBackButton from '@/utils/useBackButton';
import { Header, Body, Left, Title, Right, Button, Icon } from 'native-base';

import ExportLink from './ExportLink';
import DeleteBtn from './DeleteBtn';

const HeaderComponent = () => {
  const history = useHistory();

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
          <DeleteBtn />
        </Right>
      </Header>
    </>
  );
};

export default HeaderComponent;
