import React from 'react';
import { provideScriptContext, useScriptContext } from '@/contexts/script';
import { provideScreensContext } from '@/contexts/screens';
import PageRefresher from '@/components/PageRefresher';
import scriptPageCopy from '@/constants/copy/scriptPage';
import Text from '@/components/Text';
import OverlayLoader from '@/components/OverlayLoader';
import useRouter from '@/utils/useRouter';
import queryString from 'query-string';

import Screens from './Screens';
import Summary from './Summary';

import Header from './Header';

const Script = () => {
  const { history, location, } = useRouter();
  const { displaySummary, } = queryString.parse(location.search);

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
      {displaySummary === 'yes' ? <Summary /> : (
        <>
          <Header />
          <Screens />
        </>
      )}
    </>
  );
};

export default provideScriptContext(
  provideScreensContext(Script)
);
