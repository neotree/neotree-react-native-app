import React from 'react';
import { StatusBar } from 'react-native';
import * as NativeBase from 'native-base';
import Content from '@/components/Content';
import Form from '@/components/LocationForm';
import { useAppContext } from '@/AppContext';

function Location() {
  const { initialiseApp } = useAppContext();

  return (
    <>
      <StatusBar translucent backgroundColor="#fff" barStyle="dark-content" />

      <Content
        contentContainerStyle={{ flex: 1, justifyContent: 'center', }}
      >
        <Form onSetLocation={initialiseApp} />
      </Content>
    </>
  );
}

export default Location;
