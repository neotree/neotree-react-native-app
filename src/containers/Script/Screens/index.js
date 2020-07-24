import React from 'react';
import { useScreensContext } from '@/contexts/screens';
import Divider from '@/components/Divider';
import PageRefresher from '@/components/PageRefresher';
import scriptPageCopy from '@/constants/copy/scriptPage';
import { View, ScrollView } from 'react-native';
import Text from '@/components/Text';
import Content from '@/components/Content';
import OverlayLoader from '@/components/OverlayLoader';
import bgColorStyles from '@/styles/bgColorStyles';
import colorStyles from '@/styles/colorStyles';
import ScreenType from './ScreenType';

const Screens = () => {
  const scrollViewRef = React.useRef(null);

  const {
    getScreens,
    state: { activeScreen, screensInitialised, loadingScreens, activeScreenInitialised }
  } = useScreensContext();

  React.useEffect(() => {
    if (scrollViewRef.current) scrollViewRef.current.scrollTo({ y: 0, animated: true });
  }, [activeScreen]);

  if (loadingScreens || !(screensInitialised && activeScreenInitialised)) {
    return <OverlayLoader display style={{ backgroundColor: 'transparent' }} />;
  }

  if (!activeScreen) {
    return (
      <PageRefresher onRefresh={getScreens}>
        <Text style={{ color: '#999' }}>
          {scriptPageCopy.SCRIPT_HAS_NO_SCREENS}
        </Text>
      </PageRefresher>
    );
  }

  return (
    <>
      {!!activeScreen.data.actionText && (
        <Content
          style={{
            alignItems: 'center',
            flexDirection: 'row',
          }}
          containerProps={bgColorStyles.primaryBg}
        >
          <View style={{ flex: 1 }}>
            <Text style={[colorStyles.primaryColorContrastText]}>
              {activeScreen.data.actionText}
            </Text>
          </View>
          <View>
            <Text style={[colorStyles.primaryColorContrastText]}>
              {activeScreen.data.step}
            </Text>
          </View>
        </Content>
      )}

      <ScrollView
        ref={scrollViewRef}
      >
        {!!activeScreen.data.contentText && (
          <>
            <Content
              containerProps={{
                style: { backgroundColor: 'rgba(241, 196, 15,.2)' },
              }}
            >
              <Text style={[colorStyles.primaryColor]}>{activeScreen.data.contentText}</Text>
            </Content>
            <Divider border={false} />
          </>
        )}

        <Content>
          <Divider border={false} />
          <ScreenType />
        </Content>
      </ScrollView>
    </>
  );
};

export default Screens;
