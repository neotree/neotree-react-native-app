import React from 'react';
import { useHistory } from 'react-router-native';
import useBackButton from '@/utils/useBackButton';
import { Button, Icon } from 'native-base';
import Header from '@/components/Header';
import colorStyles from '@/styles/colorStyles';

const HeaderComponent = () => {
  const history = useHistory();

  const goBack = () => {
    history.entries = [];
    history.push('/sessions');
  };

  useBackButton(() => { goBack(); }, []);

  return (
    <>
      <Header
        title="Export"
        leftActions={(
          <>
            <Button
              transparent
              onPress={() => goBack()}
            >
              <Icon style={[colorStyles.primaryColor]} name="arrow-back" />
            </Button>
          </>
        )}
      />
    </>
  );
};

export default HeaderComponent;
