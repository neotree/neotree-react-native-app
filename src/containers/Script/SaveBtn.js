import React from 'react';
import { useScreensContext } from '@/contexts/screens';
import { useOverlayLoaderState } from '@/contexts/app';
import { Button, Icon } from 'native-base';
import theme from '@/native-base-theme/variables/commonColor';

const SaveBtn = () => {
  const { canSave, saveForm, state: { savingForm } } = useScreensContext();

  useOverlayLoaderState('savingForm', savingForm);

  return (
    <>
      {canSave() && (
        <Button
          onPress={() => saveForm({ completed: true })}
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
        ><Icon style={{ color: '#fff' }} name="save" /></Button>
      )}
    </>
  );
};

export default SaveBtn;
