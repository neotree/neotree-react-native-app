import React from 'react';
import Typography from '@/ui/Typography';
import Button from '@/ui/Button';
import { provideScriptContext, useScriptContext } from '@/contexts/script';
import { provideScreensContext, useScreensContext } from '@/contexts/screens';
import ActivityIndicator from '@/ui/ActivityIndicator';
import PageRefresher from '@/components/PageRefresher';
import scriptPageCopy from '@/constants/copy/scriptPage';
import { LayoutScrollableContent } from '@/components/Layout';
import Screens from './Screens';
import Header from './Header';

const Script = () => {
  const {
    initialisePage,
    state: { script, scriptInitialised }
  } = useScriptContext();

  const {
    canGoToNextScreen,
    goToNextScreen,
    state: { loadingScript }
  } = useScreensContext();

  if (!scriptInitialised || loadingScript) {
    return <ActivityIndicator size="large" />;
  }

  if (!script) {
    return (
      <PageRefresher onRefresh={() => initialisePage({ force: true })}>
        <Typography color="textSecondary">
          {scriptPageCopy.LOAD_SCRIPT_FAILURE_MESSAGE}
        </Typography>
      </PageRefresher>
    );
  }

  return (
    <>
      <Header />
      <LayoutScrollableContent style={{ flex: 1, justifyContent: 'center' }}>
        <Screens />

        {canGoToNextScreen() && (
          <Button
            variant="contained"
            color="primary"
            onPress={goToNextScreen}
          >
            Next
          </Button>
        )}
      </LayoutScrollableContent>
    </>
  );
};

export default provideScriptContext(
  provideScreensContext(Script)
);
