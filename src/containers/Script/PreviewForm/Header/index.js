import React from 'react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-native';
import useBackButton from '@/utils/useBackButton';
import { Header, Body, Left, Title, Right, Button, Icon } from 'native-base';
import PrintSessionForm from '@/containers/Sessions/PrintSessionForm';

const HeaderComponent = ({ form }) => {
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
          <Title>Summary</Title>
        </Body>

        <Right>
          <PrintSessionForm form={form} />
        </Right>
      </Header>
    </>
  );
};

HeaderComponent.propTypes = {
  form: PropTypes.array.isRequired
};

export default HeaderComponent;
