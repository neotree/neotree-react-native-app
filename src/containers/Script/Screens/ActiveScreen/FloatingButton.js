import React from 'react';
import PropTypes from 'prop-types';
import { Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useHistory } from 'react-router-native';
import Fab from '@/components/Fab';
import OverlayLoader from '@/components/OverlayLoader';

export default function FloatingButton({
  activeScreenEntry,
  summary,
  getLastScreen,
  activeScreen,
  createSessionSummary,
  setSummary,
  getScreen,
  setEntry,
  setActiveScreen,
  getCachedEntry,
}) {
  const history = useHistory();
  const [displayLoader, setDisplayLoader] = React.useState(false);

  return (
    <>
      {!!activeScreenEntry && (
        <Fab
          onPress={async () => {
            if (summary) return history.push('/');

            setDisplayLoader(true);
            const lastScreen = getLastScreen();

            if (activeScreen.id === lastScreen.id) {
              setDisplayLoader(false);
              try {
                const summary = createSessionSummary({ completed: true }); // await saveSession({ completed: true });
                setSummary(summary);
              } catch (e) {
                Alert.alert(
                  'ERROR',
                  'Failed to save session',
                  [
                    {
                      text: 'Close',
                      onPress: () => {},
                      style: 'cancel'
                    },
                    {
                      text: 'Exit',
                      onPress: () => history.push('/'),
                      style: 'cancel'
                    },
                  ]
                );
              }
            } else {
              const next = getScreen({ direction: 'next' });
              const nextScreen = next ? next.screen : null;
              if (!nextScreen) {
                return Alert.alert(
                  'ERROR',
                  'Failed to load next screen. Screen condition might be invalid',
                  [
                    {
                      text: 'Exit',
                      onPress: () => history.push('/'),
                      style: 'cancel'
                    },
                  ]
                );
              }
              setEntry(getCachedEntry(nextScreen));
              setActiveScreen(nextScreen);
            }
            setDisplayLoader(false);
          }}
        ><MaterialIcons size={24} color="black" style={{ color: '#fff' }} name={summary ? 'check' : 'arrow-forward'} /></Fab>
      )}

      <OverlayLoader display={displayLoader} />
    </>
  );
}

FloatingButton.propTypes = {
  activeScreenEntry: PropTypes.object,
  summary: PropTypes.object,
  getLastScreen: PropTypes.func,
  activeScreen: PropTypes.object,
  createSessionSummary: PropTypes.func,
  setSummary: PropTypes.func,
  getScreen: PropTypes.func,
  setEntry: PropTypes.func,
  setActiveScreen: PropTypes.func,
  getCachedEntry: PropTypes.func,
};
