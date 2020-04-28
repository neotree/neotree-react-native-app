import React from 'react';
import { useScreensContext } from '@/contexts/screens';
import Typography from '@/ui/Typography';
import PageRefresher from '@/components/PageRefresher';
import scriptPageCopy from '@/constants/copy/scriptPage';
import ActivityIndicator from '@/ui/ActivityIndicator';

const Screens = () => {
  const {
    getScreens,
    state: { activeScreen, screensInitialised, loadingScreens }
  } = useScreensContext();

  if (loadingScreens || !screensInitialised) return <ActivityIndicator size="large" />;

  if (!activeScreen) {
    return (
      <PageRefresher onRefresh={getScreens}>
        <Typography color="textSecondary">
          {scriptPageCopy.SCRIPT_HAS_NO_SCREENS}
        </Typography>
      </PageRefresher>
    );
  }

  return (
    <>
      <Typography variant="h2" style={{ fontWeight: 'normal' }}>{activeScreen.data.title}</Typography>
    </>
  );
};

export default Screens;
