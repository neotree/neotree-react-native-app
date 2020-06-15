import React from 'react';
import IconButton from '@/ui/IconButton';
import { useSessionsContext } from '@/contexts/sessions';

const ToggleSelect = () => {
  const { setState, state: { canSelectItems } } = useSessionsContext();

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
