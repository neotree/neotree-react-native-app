import React from 'react';
import { provideScriptContext, useScriptContext } from '@/contexts/script';
import { provideScreensContext } from '@/contexts/screens';
import { provideDiagnosesContext } from '@/contexts/diagnoses';
import PageRefresher from '@/components/PageRefresher';
import scriptPageCopy from '@/constants/copy/scriptPage';
import { Switch, Route } from 'react-router-native';
import Text from '@/components/Text';
import OverlayLoader from '@/components/OverlayLoader';
import useRouter from '@/utils/useRouter';

import Screens from './Screens';
import PreviewForm from './PreviewForm';

import Header from './Header';
import NextBtn from './NextBtn';
import SaveBtn from './SaveBtn';

const Script = () => {
  const { history, location } = useRouter();

  const {
    initialisePage,
    state: { script, scriptInitialised, loadingScript }
  } = useScriptContext();

  React.useEffect(() => {
    history.entries = [];
    history.push(location.pathname);
  }, []);

  if (!scriptInitialised || loadingScript) {
    return <OverlayLoader display style={{ backgroundColor: 'transparent' }} />;
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
  provideDiagnosesContext(
    provideScreensContext(Script)
  )
);
