import React from 'react';
import IconButton from '@/ui/IconButton';
import { useSessionsContext } from '@/contexts/sessions';
import { useOverlayLoaderState } from '@/contexts/app';

const DeleteBtn = () => {
  const { state: { selectedItems, deletingSessions }, deleteSessions } = useSessionsContext();

  useOverlayLoaderState('delete_sessions', deletingSessions);

  return (
    <>
      <IconButton
        disabled={selectedItems.length === 0}
        color="error"
        onPress={() => deleteSessions()}
        icon="md-trash"
      />
    </>
  );
};

export default DeleteBtn;
