import React from 'react';
import IconButton from '@/ui/IconButton';
import { useHistory } from 'react-router-native';

const ExportLink = () => {
  const history = useHistory();

  return (
    <>
      <IconButton
        color="primary"
        onPress={() => history.push('/sessions/export')}
        icon="md-save"
      />
    </>
  );
};

export default ExportLink;
