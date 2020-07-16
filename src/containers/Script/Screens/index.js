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
      {!!activeScreen.data.actionText && (
        <Content
          style={{
            alignItems: 'center',
            flexDirection: 'row',
          }}
          containerProps={{          
            style: { backgroundColor: '#f5f5f5' },
          }}
        >
          <View style={{ flex: 1 }}>
            <Text>{activeScreen.data.actionText}</Text>
          </View>
          <View>
            <Text>{activeScreen.data.step}</Text>
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
              <Text>{activeScreen.data.contentText}</Text>
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
