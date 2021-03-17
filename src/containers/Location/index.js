import React from 'react';
import { StatusBar } from 'react-native';
import NativeBaseContent from '@/components/NativeBaseContent';
import Form from '@/components/LocationForm';
import { useAppContext } from '@/AppContext';

function Location() {
  const { initialiseApp } = useAppContext();

  return (
    <>
      <StatusBar translucent backgroundColor="#fff" barStyle="dark-content" />

      <NativeBaseContent
        contentContainerStyle={{ flex: 1, justifyContent: 'center', }}
      >
        <Form onSetLocation={initialiseApp} />
      </NativeBaseContent>
    </>
  );
}

export default Location;
