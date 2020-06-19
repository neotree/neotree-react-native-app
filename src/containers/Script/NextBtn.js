import React from 'react';
import { useScreensContext } from '@/contexts/screens';
import { Button, Icon } from 'native-base';

const NextBtn = () => {
  const {
    canGoToNextScreen,
    goToNextScreen,
  } = useScreensContext();

  return (
    <>
      {canGoToNextScreen() && (
        <Button
          onPress={goToNextScreen}
          style={[
            {
              height: 50,
              width: 50,
              borderRadius: 25,
              alignItems: 'center',
              justifyContent: 'center',
              position: 'absolute',
              right: 20,
              bottom: 20,
            }
          ]}
        ><Icon name="arrow-forward" /></Button>
      )}
    </>
  );
};

export default NextBtn;
