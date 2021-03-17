import React from 'react';
import PropTypes from 'prop-types';
import Screen from '@/components/Screen';
import * as NativeBase from 'native-base';
import theme from '~/native-base-theme/variables/commonColor';
import { useAppContext } from '@/AppContext';

function Scripts({ navigation }) {
  const { state: { application } } = useAppContext();

  return (
    <>
      <Screen
        headerOptions={{
          body: (
            <>
              <NativeBase.Button
                transparent
                onPress={() => navigation.openDrawer()}
              >
                <NativeBase.Icon name="menu" />
              </NativeBase.Button>
              <NativeBase.Title style={{ color: theme.brandPrimary }}>{`Scripts v${application.webeditor_info.version}`}</NativeBase.Title>
            </>
          )
        }}
      >

      </Screen>
    </>
  );
}

Scripts.propTypes = {
  navigation: PropTypes.object,
};

export default Scripts;
