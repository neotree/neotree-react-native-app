import React from 'react';
import { ScrollView } from 'react-native';
import Logo from '@/components/Logo';
import { provideAuthenticationContext } from './Context';
import Form from './Form';

const Authentication = () => {
  return (
    <>
      <ScrollView
        contentContainerStyle={[
          {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
          }
        ]}
        keyboardShouldPersistTaps="never"
      >
        <>
          <Logo color="primary" />
          <Form />
        </>
      </ScrollView>
    </>
  );
};

export default provideAuthenticationContext(Authentication);
