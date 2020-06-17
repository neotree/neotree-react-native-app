import React from 'react';
import { useScreensContext } from '@/contexts/screens';
import { useOverlayLoaderState } from '@/contexts/app';
import { Button, Icon } from 'native-base';

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
        ><Icon name="save" /></Button>
      )}
    </>
  );
};

export default SaveBtn;
