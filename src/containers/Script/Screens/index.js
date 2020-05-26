import React from 'react';
import { useScreensContext } from '@/contexts/screens';
import Typography from '@/ui/Typography';
import Divider from '@/ui/Divider';
import PageRefresher from '@/components/PageRefresher';
import scriptPageCopy from '@/constants/copy/scriptPage';
import ActivityIndicator from '@/ui/ActivityIndicator';
import { View } from 'react-native';
import makeStyles from '@/ui/styles/makeStyles';
import { LayoutScrollableContent } from '@/components/Layout';
import ScreenType from './Type';

const useStyles = makeStyles(theme => ({
  actionBox: {
    backgroundColor: theme.transparentize(theme.palette.secondary.main, 0.2),
    padding: theme.spacing(2),
  },
  actionBoxText: {
    marginBottom: 3
  }
}));

const Screens = () => {
  const scrollableRef = React.useRef(null);

  const styles = useStyles();

  const {
    getScreens,
    state: { activeScreen, screensInitialised, loadingScreens, activeScreenInitialised }
  } = useScreensContext();

  React.useEffect(() => {
    if (scrollableRef.current) scrollableRef.current.scrollViewRef.scrollTo({ y: 0, animated: true });
  }, [activeScreen]);

  if (loadingScreens || !(screensInitialised && activeScreenInitialised)) {
    return <ActivityIndicator size="large" />;
  }

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
      <LayoutScrollableContent
        ref={scrollableRef}
      >
        <Typography variant="h1">{activeScreen.data.title}</Typography>

        <Divider border={false} />

        {activeScreen.data.actionText || activeScreen.data.contentText ? (
          <View style={[styles.actionBox]}>
            {!activeScreen.data.actionText ? null : (
              <>
                <Typography
                  style={[styles.actionBoxText]}
                >{activeScreen.data.actionText}</Typography>
              </>
            )}

            {!activeScreen.data.contentText ? null : (
              <>
                <Typography
                  style={[styles.actionBoxText]}
                  variant="caption"
                >{activeScreen.data.contentText}</Typography>
              </>
            )}
          </View>
        ) : null}

        <Divider border={false} spacing={2} />

        <ScreenType />
      </LayoutScrollableContent>
    </>
  );
};

export default Screens;
