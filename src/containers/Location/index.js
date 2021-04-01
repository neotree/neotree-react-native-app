import React from 'react';
import { StatusBar, TouchableOpacity } from 'react-native';
import NativeBaseContent from '@/components/NativeBaseContent';
import Form from '@/components/LocationForm';
import { useAppContext } from '@/AppContext';
import Header from '@/components/Header';
import { H1, Icon } from 'native-base';
import colorStyles from '@/styles/colorStyles';
import { useHistory } from 'react-router-native';

function Location() {
  const history = useHistory();
  const { initialiseApp, state: { location } } = useAppContext();

  const goBack = () => {
    history.entries = [];
    history.push('/');
  };

  const title = 'Set location';

  return (
    <>
      {location ? (
        <Header
          title={title}
          leftActions={(
            <>
              <TouchableOpacity
                style={{ padding: 10 }}
                onPress={() => goBack()}
              >
                <Icon style={[colorStyles.primaryColor]} name="arrow-back" />
              </TouchableOpacity>
            </>
          )}
        />
      ) : (
        <StatusBar translucent backgroundColor="#fff" barStyle="dark-content" />
      )}

      <NativeBaseContent
        contentContainerStyle={{ flex: 1, justifyContent: 'center', }}
      >
        {!location && <H1 style={{ textAlign: 'center' }}>{title}</H1>}
        <Form
          location={location}
          onSetLocation={initialiseApp}
        />
      </NativeBaseContent>
    </>
  );
}

export default Location;
