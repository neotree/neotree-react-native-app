import React from 'react';
import { useSessionsContext } from '@/contexts/sessions';
import { useOverlayLoaderState } from '@/contexts/app';
import { Button, Icon } from 'native-base';

const DeleteBtn = () => {
  const { state: { selectedItems, deletingSessions }, deleteSessions } = useSessionsContext();

  useOverlayLoaderState('delete_sessions', deletingSessions);

  const disabled = selectedItems.length === 0;

  return (
    <>
      <Button
        transparent
        disabled={disabled}
        onPress={() => deleteSessions()}
      >
        <Icon name="trash" style={[disabled ? null : { color: '#b20008' }]} />
      </Button>
    </>
  );
};

export default DeleteBtn;
