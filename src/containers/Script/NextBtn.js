import React from 'react';
import { useScreensContext } from '@/contexts/screens';
import { Icon } from 'native-base';
import { Link } from 'react-router-native';
import { TouchableOpacity } from 'react-native';
import theme from '@/native-base-theme/variables/commonColor';

const NextBtn = () => {
  const {
    canGoToNextScreen,
    getScreenLink,
  } = useScreensContext();

  return (
    <>
      {canGoToNextScreen() && (
        <Link
          replace
          to={getScreenLink('next')}
          component={TouchableOpacity}
          style={[
            {
              backgroundColor: theme.brandInfo,
              height: 50,
              width: 50,
              borderRadius: 25,
              alignItems: 'center',
              justifyContent: 'center',
              position: 'absolute',
              right: 20,
              bottom: 20,
              elevation: 24,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.5,
              shadowRadius: 5,
            }
          ]}
        ><Icon style={{ color: '#fff' }} name="arrow-forward" /></Link>
      )}
    </>
  );
};

export default NextBtn;
