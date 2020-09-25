import React from 'react';
import { useHistory } from 'react-router-native';
import useBackButton from '@/utils/useBackButton';
import { Icon } from 'native-base';
import Header from '@/components/Header';
import colorStyles from '@/styles/colorStyles';
import ExportLink from './ExportLink';
import DeleteBtn from './DeleteBtn';
import { TouchableOpacity, View } from 'react-native';

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
            <TouchableOpacity
              onPress={() => goBack()}
            >
              <Icon style={[colorStyles.primaryColor]} name="arrow-back" />
            </TouchableOpacity>
          </>
        )}
        rightActions={(
          <>
            <ExportLink />
            <View style={{ margin: 10 }} />
            <DeleteBtn />
          </>
        )}
      />
    </>
  );
};

export default HeaderComponent;
