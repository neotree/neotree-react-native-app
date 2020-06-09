import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import makeStyles from '@/ui/styles/makeStyles';
import Logo from '@/components/Logo';
import Animated from 'react-native-reanimated';
import Typography from '@/ui/Typography';
import styles from './styles';
import useSplashLogoAnimation from './useSplashLogoAnimation';

export { useSplashLogoAnimation };

const useStyles = makeStyles(styles);

const Splash = ({ children }) => {
  // const scale = useSplashLogoAnimation();

  const styles = useStyles();

  return (
    <>
      <View style={[styles.root]}>
        <View style={[styles.content]}>
          <Animated.View
            style={[
              styles.logoContainer,
              // { transform: [{ scale }] }
            ]}
          >
            <Logo />
          </Animated.View>
          {typeof children === 'string' ?
            <Typography variant="caption" style={[styles.text]}>{children}</Typography>
            :
            children}
        </View>
      </View>
    </>
  );
};

Splash.propTypes = {
  children: PropTypes.node
};

export default Splash;
