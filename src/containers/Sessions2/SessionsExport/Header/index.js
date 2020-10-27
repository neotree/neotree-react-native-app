import React from 'react';
import { useHistory } from 'react-router-native';
import useBackButton from '@/utils/useBackButton';
import { Icon } from 'native-base';
import Header from '@/components/Header';
import colorStyles from '@/styles/colorStyles';
import { TouchableOpacity } from 'react-native';

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
            <TouchableOpacity
              transparent
              onPress={() => goBack()}
            >
              <Icon style={[colorStyles.primaryColor]} name="arrow-back" />
            </TouchableOpacity>
          </>
        )}
      />
    </>
  );
};

export default HeaderComponent;
