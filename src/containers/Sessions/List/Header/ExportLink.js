import React from 'react';
import { useHistory } from 'react-router-native';
import { Button, Icon } from 'native-base';
import colorStyles from '@/styles/colorStyles';

const ExportLink = () => {
  const history = useHistory();

  return (
    <>
      <Button
        transparent
        onPress={() => history.push('/sessions/export')}
      >
        <Icon style={[colorStyles.primaryColor]} name="save" />
      </Button>
    </>
  );
};

export default ExportLink;
