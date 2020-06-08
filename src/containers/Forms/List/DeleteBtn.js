import React from 'react';
import IconButton from '@/ui/IconButton';
import { useFormsContext } from '@/contexts/forms';
import { useOverlayLoaderState } from '@/contexts/app';

const DeleteBtn = () => {
  const { state: { selectedItems, deletingForms }, deleteForms } = useFormsContext();

  useOverlayLoaderState('delete_forms', deletingForms);

  return (
    <>
      <IconButton
        disabled={selectedItems.length === 0}
        color="error"
        onPress={() => deleteForms()}
        icon="md-trash"
      />
    </>
  );
};

export default DeleteBtn;
