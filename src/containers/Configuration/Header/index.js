import React from 'react';
import { useHistory } from 'react-router-native';
import useBackButton from '@/utils/useBackButton';
import { Button, Icon } from 'native-base';
import Header from '@/components/Header';

const HeaderComponent = () => {
  const history = useHistory();

  const goBack = () => {
    history.entries = [];
    history.push('/');
  };

  useBackButton(() => { goBack(); }, []);

  return (
    <>
      <Header
        title="Configuration"
        leftActions={(
          <>
            <Button
              transparent
              onPress={() => goBack()}
            >
              <Icon name="arrow-back" />
            </Button>
          </>
        )}
      />
    </>
  );
};

export default HeaderComponent;
