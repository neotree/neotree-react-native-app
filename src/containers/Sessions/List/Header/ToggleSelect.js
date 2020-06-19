import React from 'react';
import { useSessionsContext } from '@/contexts/sessions';
import { Button, Icon } from 'native-base';

const ToggleSelect = () => {
  const { setState, state: { canSelectItems } } = useSessionsContext();

  return (
    <>
      <Button
        transparent
        onPress={() => setState({ canSelectItems: !canSelectItems })}
      >
        <Icon name="checkbox" />
      </Button>
    </>
  );
};

export default ToggleSelect;
