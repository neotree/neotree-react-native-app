import React from 'react';
import { useScreensContext } from '@/contexts/screens';
import { ScrollView } from 'react-native';

const ScreenContainer = ({ children, }) => {
  const scrollViewRef = React.useRef(null);

  const {
    state: { activeScreen, }
  } = useScreensContext();

  React.useEffect(() => {
    if (scrollViewRef.current) scrollViewRef.current.scrollTo({ y: 0, animated: true });
  }, [activeScreen]);

  return (
    <>
      <ScrollView
        ref={scrollViewRef}
      >
        {children}
      </ScrollView>
    </>
  );
};

export default ScreenContainer;
