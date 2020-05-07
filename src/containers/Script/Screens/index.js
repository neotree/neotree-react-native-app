import React from 'react';
import { useScreensContext } from '@/contexts/screens';
import Typography from '@/ui/Typography';
import Divider from '@/ui/Divider';
import PageRefresher from '@/components/PageRefresher';
import scriptPageCopy from '@/constants/copy/scriptPage';
import ActivityIndicator from '@/ui/ActivityIndicator';

import ScreenType from './Type';

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
      <Typography variant="h1">{activeScreen.data.title} - {activeScreen.type}</Typography>

      <Divider border={false} spacing={2} />

      {!activeScreen.data.actionText ? null : (
        <>
          <Typography style={{ fontWeight: 'normal' }}>{activeScreen.data.actionText}</Typography>
          <Divider border={false} spacing={2} />
        </>
      )}

      {!activeScreen.data.contentText ? null : (
        <>
          <Typography style={{ fontWeight: 'normal' }}>{activeScreen.data.contentText}</Typography>
          <Divider border={false} spacing={2} />
        </>
      )}

      <ScreenType />
    </>
  );
};

export default Screens;
