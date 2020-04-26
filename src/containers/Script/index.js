import React from 'react';
import Typography from '@/ui/Typography';
import { provideScriptContext, useScriptContext } from '@/contexts/script';
import ActivityIndicator from '@/ui/ActivityIndicator';
import PageRefresher from '@/components/PageRefresher';
import scriptPageCopy from '@/constants/copy/scriptPage';
import { LayoutCard } from '@/components/Layout';

const Script = () => {
  const { state: { script, loadingScript, loadingScreens }, initialisePage } = useScriptContext();

  if (loadingScript) return <ActivityIndicator size="large" />;

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
      <LayoutCard>
        <Typography variant="h4">{script.data.title}</Typography>
        {loadingScreens && <ActivityIndicator size="large" />}
      </LayoutCard>
    </>
  );
};

export default provideScriptContext(Script);
