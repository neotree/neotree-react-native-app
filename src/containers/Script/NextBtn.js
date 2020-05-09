import React from 'react';
import IconButton from '@/ui/IconButton';
import { useScreensContext } from '@/contexts/screens';
import makeStyles from '@/ui/styles/makeStyles';

const useStyles = makeStyles(theme => {
  return {
    root: {
      margin: theme.spacing(2),
      position: 'absolute',
      bottom: 0,
      right: 0,
    }
  };
});

const NextBtn = () => {
  const styles = useStyles();

  const {
    canGoToNextScreen,
    goToNextScreen,
  } = useScreensContext();

  return (
    <>
      {canGoToNextScreen() && (
        <IconButton
          variant="contained"
          color="primary"
          onPress={goToNextScreen}
          style={[styles.root]}
          icon="md-arrow-forward"
        />
      )}
    </>
  );
};

export default NextBtn;
