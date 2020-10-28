import React from 'react';
import { useHistory } from 'react-router-native';
import { Icon } from 'native-base';
import colorStyles from '@/styles/colorStyles';
import { TouchableOpacity } from 'react-native';

const ExportLink = () => {
  const history = useHistory();

  return (
    <>
      <TouchableOpacity
        style={{ paddingHorizontal: 5 }}
        onPress={() => history.push('/sessions/export')}
      >
        <Icon style={[colorStyles.primaryColor]} name="save" />
      </TouchableOpacity>
    </>
  );
};

export default ExportLink;
