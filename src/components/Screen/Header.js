import React from 'react';
import * as NativeBase from 'native-base';
import { useScreenContext } from './Context';

function Header() {
  const { headerOptions } = useScreenContext();

  return (
    <>
      <NativeBase.Header>
        {!!headerOptions.left && (
          <NativeBase.Left>
            {headerOptions.left}
          </NativeBase.Left>
        )}

        {!!headerOptions.body && (
          <NativeBase.Body>
            {headerOptions.body}
          </NativeBase.Body>
        )}

        {!!headerOptions.right && (
          <NativeBase.Right>
            {headerOptions.right}
          </NativeBase.Right>
        )}
      </NativeBase.Header>
    </>
  );
}

export default Header;
