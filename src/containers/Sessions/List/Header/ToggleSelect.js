import React from 'react';
import { useSessionsContext } from '@/contexts/sessions';
import { Icon } from 'native-base';
import { TouchableOpacity } from 'react-native';

const ToggleSelect = () => {
  const { setState, state: { canSelectItems } } = useSessionsContext();

  return (
    <>
      <TouchableOpacity
        onPress={() => setState({ canSelectItems: !canSelectItems })}
      >
        <Icon name="checkbox" />
      </TouchableOpacity>
    </>
  );
};

export default ToggleSelect;
