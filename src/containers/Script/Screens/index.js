import React from 'react';
import { useScreensContext } from '@/contexts/screens';
import Divider from '@/components/Divider';
import PageRefresher from '@/components/PageRefresher';
import scriptPageCopy from '@/constants/copy/scriptPage';
import { View, ScrollView } from 'react-native';
import { Spinner } from 'native-base';
import Text from '@/components/Text';
import Content from '@/components/Content';
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
    return <Spinner color="blue" />;
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
      <ScrollView
        ref={scrollViewRef}
      >
        <Content padder>
          <Divider border={false} />

          <Text
            style={[{ fontSize: 30, fontWeight: 'bold' }]}
          >{activeScreen.data.title}</Text>

          <Divider border={false} />

          {activeScreen.data.actionText || activeScreen.data.contentText ? (
            <View
              style={[{ backgroundColor: 'rgba(241, 196, 15,.2)', padding: 10 }]}
            >
              {!activeScreen.data.actionText ? null : (
                <>
                  <Text
                    style={[{ marginBottom: 10 }]}
                  >{activeScreen.data.actionText}</Text>
                </>
              )}

              {!activeScreen.data.contentText ? null : (
                <>
                  <Text
                    style={[{ marginBottom: 10 }]}
                    variant="caption"
                  >{activeScreen.data.contentText}</Text>
                </>
              )}
            </View>
          ) : null}

          <Divider border={false} spacing={2} />

          <ScreenType />
        </Content>
      </ScrollView>
    </>
  );
};

export default Screens;
