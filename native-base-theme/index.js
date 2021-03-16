import React from 'react';
import PropTypes from 'prop-types';
import * as NativeBase from 'native-base';
import * as Font from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import getTheme from './components';
import material from './variables/commonColor';

export default function NativeBaseContainer({ children, onInit }) {
  const [fontsLoaded, setFontsLoaded] = React.useState(false);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    (async () => {
      try {
        await Font.loadAsync({
          Roboto: require('native-base/Fonts/Roboto.ttf'),
          Roboto_medium: require('native-base/Fonts/Roboto_medium.ttf'),
          ...Ionicons.font,
        });
        setFontsLoaded(true);
        onInit(null);
      } catch (e) {
        setError(e.message);
        onInit(e.message);
      }
    })();
  }, []);

  if (!fontsLoaded || error) return null;

  return (
    <NativeBase.Root>
      <NativeBase.Container>
        <NativeBase.StyleProvider style={getTheme(material)}>
          {children}
        </NativeBase.StyleProvider>
      </NativeBase.Container>
    </NativeBase.Root>
  );
}

NativeBaseContainer.propTypes = {
  children: PropTypes.node,
  onInit: PropTypes.func
};
