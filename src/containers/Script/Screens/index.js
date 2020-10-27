import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'native-base';
import { Alert } from 'react-native';
import Fab from '@/components/Fab';
import OverlayLoader from '@/components/OverlayLoader';
import { useHistory, useLocation } from 'react-router-native';
import * as api from '@/api';
import ActiveScreen from './ActiveScreen';
import Summary from './Summary';

const Screens = props => {
  const history = useHistory();
  const location = useLocation();

  const { screens, script, configuration, diagnoses, } = props;
  const [activeScreen, _setActiveScreen] = React.useState(null);
  const [hideActiveScreen, setHideActiveScreen] = React.useState(false);
  const setActiveScreen = s => {
    setHideActiveScreen(true);
    setTimeout(() => setHideActiveScreen(false), 0);
    _setActiveScreen(s);
  };

  const [startTime] = React.useState(new Date().toISOString());
  const [summary, setSummary] = React.useState(null);
  const [savingSession, setSavingSession] = React.useState(false);

  const [entries, setEntries] = React.useState([]);
  const [cachedEntries, setCachedEntries] = React.useState([]);
  const setEntry = entry => !entry ? null : setEntries(entries => {
    const isAlreadyEntered = entries.map(e => e.screen.id).includes(entry.screen.id);
    return isAlreadyEntered ? entries.map(e => e.screen.id === entry.screen.id ? entry : e) : [...entries, entry];
  });
  const setCacheEntry = entry => !entry ? null : setCachedEntries(entries => {
    const isAlreadyEntered = entries.map(e => e.screen.id).includes(entry.screen.id);
    return isAlreadyEntered ? entries.map(e => e.screen.id === entry.screen.id ? entry : e) : [...entries, entry];
  });

  const getScreenIndex = screenId => !screenId ? -1 : screens.map(s => s.screen_id).indexOf(screenId);

  React.useEffect(() => { setActiveScreen(screens[0]); }, []);

  React.useEffect(() => {
    if (activeScreen) {
      if (summary) {
        history.push(`${location.pathname}?display=summary`);
      } else {
        history.push(`${location.pathname}?display=active_screen&screenId=${location.screen_id}`);
      }
    }
  }, [activeScreen, summary]);

  if (!activeScreen) return null;

  const activeScreenIndex = getScreenIndex(activeScreen.screen_id);
  const activeScreenEntry = entries.filter(e => e.screen.id === activeScreen.screen_id)[0];
  const parseCondition = require('./_parseCondition').default({ entries, configuration });
  const evaluateCondition = require('./_evaluateCondition').default;
  const getScreen = require('./_getScreen').default({
    screens,
    activeScreenIndex,
    parseCondition,
    evaluateCondition,
  });
  const getLastScreen = require('./_getLastScreen').default({
    screens,
    activeScreen,
    parseCondition,
    evaluateCondition,
    entries
  });
  const createSessionSummary = require('./_createSessionSummary').default({
    activeScreen,
    parseCondition,
    evaluateCondition,
    entries,
    diagnoses,
    script,
    startTime,
  });
  const saveSession = params => api.saveSession(createSessionSummary(params));

  if (savingSession) return <OverlayLoader display />;

  return (
    <>
      {summary ? (
        <Summary
          {...props}
          summary={summary}
          clearSummary={() => setSummary(null)}
        />
      ) : (
        <ActiveScreen
          {...props}
          hidden={hideActiveScreen}
          saveSession={saveSession}
          screen={activeScreen}
          activeScreenIndex={activeScreenIndex}
          setActiveScreen={(s = activeScreen) => setActiveScreen(s)}
          entries={entries}
          entry={activeScreenEntry}
          cachedEntry={cachedEntries.filter(e => e.screen.id === activeScreen.screen_id)[0]}
          setEntry={setEntry}
          setCacheEntry={setCacheEntry}
          removeEntry={screenId => {
            setCacheEntry(entries.filter(e => e.screen.id === screenId)[0]);
            setEntries(entries => entries.filter(e => e.screen.id !== screenId));
          }}
          getScreenIndex={getScreenIndex}
          getScreen={getScreen}
          parseCondition={parseCondition}
          evaluateCondition={evaluateCondition}
        />
      )}

      {activeScreenEntry && (
        <Fab
          onPress={async () => {
            const lastScreen = getLastScreen();

            if (summary) {
              setSavingSession(true);
              try {
                await saveSession();
                history.push('/');
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
              return setSavingSession(false);
            }

            if (activeScreen.screen_id === lastScreen.screen_id) {
              const summary = createSessionSummary({ completed: true, });
              setSummary(summary);
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
              setActiveScreen(nextScreen);
            }
          }}
        ><Icon style={{ color: '#fff' }} name={summary ? 'save' : 'arrow-forward'} /></Fab>
      )}
    </>
  );
};

Screens.propTypes = {
  screens: PropTypes.array.isRequired,
  diagnoses: PropTypes.array.isRequired,
  script: PropTypes.object.isRequired,
  dataStatus: PropTypes.object.isRequired,
  configuration: PropTypes.object,
  authenticatedUser: PropTypes.object.isRequired,
};

export default Screens;
