import React from 'react';
import Screen from '@/components/Screen';
import * as NativeBase from 'native-base';

function Scripts() {
  return (
    <>
      <Screen
        headerOptions={{
          body: (
            <>
              <NativeBase.Title>
                Scripts
              </NativeBase.Title>
            </>
          )
        }}
      >

      </Screen>
    </>
  );
}

export default Scripts;
