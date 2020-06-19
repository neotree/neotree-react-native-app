import React from 'react';
import { TouchableOpacity } from 'react-native';
import Divider from '@/components/Divider';
import { useAppContext } from '@/contexts/app';
import CheckBox from '@/components/CheckBox';
import Text from '@/components/Text';
import Container from './Container';

const Screen = () => {
  const { setState } = useAppContext();

  return (
    <>
      <Container>
        <Text style={{ fontSize: 30, fontWeight: 'bold' }}>Debug</Text>

        <Divider border={false} />

        <Text style={{ color: '#b20008' }}>This will be displayed when in dev mode only</Text>

        <Divider border={false} />

        <TouchableOpacity
          style={{ flexDirection: 'row', alignItems: 'center' }}
        >
          <CheckBox
            checked={false}
            onPress={() => setState({ hideDebugButton: true })}
          />
          <Text>I don't want to debug</Text>
        </TouchableOpacity>
      </Container>
    </>
  );
};

export default Screen;
