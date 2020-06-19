import React from 'react';
import { useHistory } from 'react-router-native';
import { Button, Icon } from 'native-base';

const ExportLink = () => {
  const history = useHistory();

  return (
    <>
      <Button
        transparent
        onPress={() => history.push('/sessions/export')}
      >
        <Icon name="save" />
      </Button>
    </>
  );
};

export default ExportLink;
