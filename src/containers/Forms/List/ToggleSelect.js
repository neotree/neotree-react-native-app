import React from 'react';
import IconButton from '@/ui/IconButton';
import { useFormsContext } from '@/contexts/forms';

const ToggleSelect = () => {
  const { setState, state: { canSelectItems } } = useFormsContext();

  return (
    <>
      <IconButton
        color="primary"
        onPress={() => setState({ canSelectItems: !canSelectItems })}
        icon="md-checkbox"
      />
    </>
  );
};

export default ToggleSelect;
