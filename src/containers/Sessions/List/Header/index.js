import React from 'react';
import { useHistory } from 'react-router-native';
import useBackButton from '@/utils/useBackButton';
import { Button, Icon } from 'native-base';
import Header from '@/components/Header';
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
      <Header
        title="Session history"
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
        rightActions={(
          <>
            <ExportLink />
            <DeleteBtn />
          </>
        )}
      />
    </>
  );
};

export default HeaderComponent;
