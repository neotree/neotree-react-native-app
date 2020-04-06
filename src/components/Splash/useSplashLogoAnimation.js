import React from 'react';
import Animated, { useCode, cond, eq, set } from 'react-native-reanimated';
import { withTimingTransition } from 'react-native-redash';

export default () => {
  const scale = React.useRef(new Animated.Value(0));
  const scaleAnimation = withTimingTransition(scale.current);

  useCode(() => cond(eq(scale.current, 0), set(scale.current, 1)), []);

  return scaleAnimation;
};
