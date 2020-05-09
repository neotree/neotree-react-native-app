import React from 'react';
import Typography from '@/ui/Typography';
import { provideScriptContext, useScriptContext } from '@/contexts/script';
import { provideScreensContext, useScreensContext } from '@/contexts/screens';
import ActivityIndicator from '@/ui/ActivityIndicator';
import PageRefresher from '@/components/PageRefresher';
import scriptPageCopy from '@/constants/copy/scriptPage';
import { LayoutScrollableContent } from '@/components/Layout';
import Screens from './Screens';
import Header from './Header';
import NextBtn from './NextBtn';

const Script = () => {
  const scrollableRef = React.useRef(null);

  const {
    initialisePage,
    state: { script, scriptInitialised }
  } = useScriptContext();

  const {
    state: { loadingScript }
  } = useScreensContext();

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
      <Header />

      <LayoutScrollableContent
        ref={scrollableRef}
      >
        <Screens />
      </LayoutScrollableContent>

      <NextBtn />
    </>
  );
};

export default provideScriptContext(
  provideScreensContext(Script)
);
