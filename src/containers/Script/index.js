import React from 'react';
import Typography from '@/ui/Typography';
import { provideScriptContext, useScriptContext } from '@/contexts/script';
import { provideScreensContext } from '@/contexts/screens';
import ActivityIndicator from '@/ui/ActivityIndicator';
import PageRefresher from '@/components/PageRefresher';
import scriptPageCopy from '@/constants/copy/scriptPage';
import { Switch, Route } from 'react-router-native';

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
    return <ActivityIndicator size="large" />;
  }

  if (!script) {
    return (
      <PageRefresher
        onRefresh={() => initialisePage({ force: true })}
      >
        <Typography color="textSecondary">
          {scriptPageCopy.LOAD_SCRIPT_FAILURE_MESSAGE}
        </Typography>
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
