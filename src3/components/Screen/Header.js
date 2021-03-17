import React from 'react';
import * as NativeBase from 'native-base';
import { useScreenContext } from './Context';
import theme from '~/native-base-theme/variables/commonColor';

function Header() {
  const { headerOptions } = useScreenContext();

  return (
    <>
      <NativeBase.Header
        style={{ backgroundColor: '#fff' }}
        androidStatusBarColor={theme.brandPrimary}
      >
        {!!headerOptions.left && (
          <NativeBase.Left>
            {headerOptions.left}
          </NativeBase.Left>
        )}

        {!!headerOptions.body && (
          <NativeBase.Body style={{ flexDirection: 'row', alignItems: 'center' }}>
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
