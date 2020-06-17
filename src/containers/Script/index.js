import React from 'react';
import { provideScriptContext, useScriptContext } from '@/contexts/script';
import { provideScreensContext } from '@/contexts/screens';
import { Spinner, Text } from 'native-base';
import PageRefresher from '@/components/PageRefresher';
import scriptPageCopy from '@/constants/copy/scriptPage';
import { Switch, Route } from 'react-router-native';
import { View } from 'react-native';

import Screens from './Screens';
import PreviewForm from './PreviewForm';

import Header from './Header';
import NextBtn from './NextBtn';
import SaveBtn from './SaveBtn';

const Script = () => {
  const {
    initialisePage,
    state: { script, scriptInitialised, loadingScript }
  } = useScriptContext();

  if (!scriptInitialised || loadingScript) {
    return (
      <View style={{ alignItems: 'center', justifyContent: 'center', margin: 100 }}>
        <Spinner color="blue" />
      </View>
    );
  }

  if (!script) {
    return (
      <PageRefresher
        onRefresh={() => initialisePage({ force: true })}
      >
        <Text style={{ color: '#999' }}>
          {scriptPageCopy.LOAD_SCRIPT_FAILURE_MESSAGE}
        </Text>
      </PageRefresher>
    );
  }

  return (
    <>
      <Switch>
        <Route
          path="/script/:scriptId/preview-form"
          component={PreviewForm}
        />

        <Route
          render={() => (
            <>
              <Header />

              <Screens />

              <NextBtn />

              <SaveBtn />
            </>
          )}
        />
      </Switch>
    </>
  );
};

export default provideScriptContext(
  provideScreensContext(Script)
);
