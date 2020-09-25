import React from 'react';
import { useScreensContext } from '@/contexts/screens';
import { Icon, Button } from 'native-base';
import { Link } from 'react-router-native';
import { TouchableOpacity } from 'react-native';
import theme from '@/native-base-theme/variables/commonColor';

const NextBtn = () => {
  const {
    goToSummary,
    canSave,
    canGoToNextScreen,
    getScreenLink,
  } = useScreensContext();

  const display = canSave() || canGoToNextScreen();
  const Btn = canSave() ? Button : Link;
  const btnProps = canSave() ? {
    onPress: () => goToSummary(),
  } : {
    replace: true,
    to: getScreenLink('next'),
    component: TouchableOpacity,
  };

  return (
    <>
      {display && (
        <Btn
          {...btnProps}
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
        ><Icon style={{ color: '#fff' }} name="arrow-forward" /></Btn>
      )}
    </>
  );
};

export default NextBtn;
