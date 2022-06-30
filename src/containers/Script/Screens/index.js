import React from 'react';
import PropTypes from 'prop-types';
import { Alert, Platform } from 'react-native';
import OverlayLoader from '@/components/OverlayLoader';
import { useHistory, useLocation } from 'react-router-native';
import * as api from '@/api';
import { useAppContext } from '@/AppContext';
import ActiveScreen from './ActiveScreen';
import Summary from './Summary';
import { useContext } from '../Context';

const Screens = props => {
  const { setState: setAppState, state: appState } = useAppContext();
  const history = useHistory();
  const location = useLocation();

  const { screens, script, configuration, diagnoses, matches, } = props;
  const [activeScreen, _setActiveScreen] = React.useState(null);
  const [hideActiveScreen, setHideActiveScreen] = React.useState(false);
  const setActiveScreen = s => {
    setHideActiveScreen(true);
    setTimeout(() => setHideActiveScreen(false), 0);
    _setActiveScreen(s);
  };

  const [stats, setStats] = React.useState({});
  const [startTime] = React.useState(new Date().toISOString());
  const [summary, setSummary] = React.useState(null);
  const [savedSession, setSavedSession] = React.useState(null);
  const [displayLoader, setDisplayLoader] = React.useState(false);
  const [screensWithNoAutoFill, _setScreensWithNoAutoFill] = React.useState({});
  const setScreensWithNoAutoFill = s => _setScreensWithNoAutoFill(prev => ({ ...prev, ...s }));

  const [entries, setEntries] = React.useState([]);
  const [cachedEntries, setCachedEntries] = React.useState([]);
  const setCacheEntry = entry => !entry ? null : setCachedEntries(entries => {
    const isAlreadyEntered = entries.map(e => e.screen.id).includes(entry.screen.id);
    return isAlreadyEntered ? entries.map(e => e.screen.id === entry.screen.id ? entry : e) : [...entries, entry];
  });
  const getCachedEntry = s => !s ? null : cachedEntries.filter(e => e.screen.id === s.id)[0];
  const setEntry = entry => {
    if (entry) {
      setScreensWithNoAutoFill({ [entry.screen.id]: true });
      setEntries(entries => {
        const isAlreadyEntered = entries.map(e => e.screen.id).includes(entry.screen.id);
        return isAlreadyEntered ? entries.map(e => e.screen.id === entry.screen.id ? entry : e) : [...entries, entry];
      });
      setCacheEntry(entry);
    }
  };

  const getScreenIndex = screenId => !screenId ? -1 : screens.map(s => s.id).indexOf(screenId);

  React.useEffect(() => { setActiveScreen(screens[0]); }, []);

  React.useEffect(() => {
    if (activeScreen) {
      setStats(prev => {
        const screenStats = prev[activeScreen.screen_id] || [];
        screenStats.push({ start_time: new Date(), end_time: null, });
        return { ...prev, [activeScreen.screen_id]: screenStats, };
      });
      if (summary) {
        history.push(`${location.pathname}?display=summary`);
      } else {
        history.push(`${location.pathname}?display=active_screen&screenId=${location.screen_id}`);
      }
    }
  }, [activeScreen, summary]);

  if (!activeScreen) return null;

  const activeScreenIndex = getScreenIndex(activeScreen.id);
  const activeScreenEntry = entries.filter(e => e.screen.id === activeScreen.id)[0];
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
    appState,
    activeScreen,
    parseCondition,
    evaluateCondition,
    entries,
    diagnoses,
    script,
    startTime,
    matches,
  });

  createSessionSummary();

  const getSuggestedDiagnoses = require('./_getSuggestedDiagnoses').default({
    parseCondition,
    evaluateCondition,
    diagnoses,
  });

  const saveSession = params => new Promise((resolve, reject) => {
    setDisplayLoader(true);
    const summary = createSessionSummary(params);
    (async () => {
      try {
        const { application } = await api.saveSession(summary);
        setAppState(s => ({ application: { ...s.application, ...application } }));
        setSavedSession(summary);
        resolve(summary);
      } catch (e) { reject(e); }
      setDisplayLoader(false);
    })();
  });

  const { state: { pageOptions } } = useContext();

  const cancelScript = () => {
    Alert.alert(
      'Cancel script',
      'Are you sure you want to cancel script?',
      [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel'
        },
        {
          text: 'Ok',
          onPress: () => {
            (async () => {
              await saveSession({ canceled: true, });
              history.push('/');
            })();
          }
        }
      ],
      { cancelable: false }
    );
  };

  const goBack = () => {
    const goBack = () => {
      if (activeScreenIndex < 1) return cancelScript();
      const prev = getScreen({ direction: 'back' });
      setActiveScreen(prev ? prev.screen : null);
    };
    if (pageOptions && pageOptions.onBack) return pageOptions.onBack(goBack);
    goBack();
  };

  const goNext = async () => {
    if (summary) return history.push('/');

    setDisplayLoader(true);
    const lastScreen = getLastScreen();
    const next = getScreen({ direction: 'next' });
    const nextScreen = next ? next.screen : lastScreen;

    const activeScreenStats = stats[activeScreen.screen_id] || [];
    const _stats = {
      ...stats,
      [activeScreen.screen_id]: activeScreenStats.map((stat, i) => {
        if (i !== (activeScreenStats.length - 1)) return stat;
        return { ...stat, end_time: new Date(), };
      }), 
    };
    setStats(_stats);
    // console.log(Object.keys(_stats).map(screenId => {
    //   return {
    //     type: 'view',
    //     count: _stats[screenId].length,
    //     duration: _stats[screenId].reduce((acc, stat) => {
    //       if (!(stat.end_time && stat.start_time)) return acc;
    //       const ms = new Date(stat.end_time) - new Date(stat.start_time);
    //       const secs = ms / 1000; // Math.floor(Math.abs(ms) / 1000);
    //       const mins = parseFloat((secs / 60).toFixed(2)); // Math.floor(secs / 60);
    //       return acc + mins;
    //     }, 0),
    //     data: {
    //       screenId,
    //     }
    //   };
    // }));

    if (activeScreen.id === lastScreen.id) {
      if (script.data.exportable === false) return history.push('/');
      
      setDisplayLoader(false);
      try {
        const summary = await saveSession({ completed: true }); // createSessionSummary({ completed: true });
        try {
          await api.addStats({
            user: appState.authenticatedUser.user.email,
            device: Platform.OS,
            stats: Object.keys(_stats).map(screenId => {
              return {
                type: 'view',
                count: _stats[screenId].length,
                duration: _stats[screenId].reduce((acc, stat) => {
                  if (!(stat.end_time && stat.start_time)) return acc;
                  const ms = new Date(stat.end_time) - new Date(stat.start_time);
                  const secs = ms / 1000; // Math.floor(Math.abs(ms) / 1000);
                  const mins = parseFloat((secs / 60).toFixed(2)); // Math.floor(secs / 60);
                  return acc + mins;
                }, 0),
                data: {
                  screenId,
                  screenTitle: screens.filter(s => s.screen_id === screenId)[0].data.title,
                }
              };
            }),
          });
        } catch (e) { /* DO NOTHING */ }
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
  };

  const renderComponent = Component => (
    <Component
      {...props}
      stats={stats}
      goBack={goBack}
      goNext={goNext}
      cancelScript={cancelScript}
      screensWithNoAutoFill={screensWithNoAutoFill}
      setScreensWithNoAutoFill={setScreensWithNoAutoFill}
      getLastScreen={getLastScreen}
      hidden={hideActiveScreen}
      saveSession={saveSession}
      screen={activeScreen}
      activeScreenIndex={activeScreenIndex}
      setActiveScreen={(s = activeScreen) => {
        setEntry(getCachedEntry(s));
        setActiveScreen(s);
      }}
      entries={entries}
      entry={activeScreenEntry}
      cachedEntry={cachedEntries.filter(e => e.screen.id === activeScreen.id)[0]}
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
      activeScreenEntry={activeScreenEntry}
      summary={summary}
      savedSession={savedSession}
      activeScreen={activeScreen}
      createSessionSummary={createSessionSummary}
      getSuggestedDiagnoses={getSuggestedDiagnoses}
      setSummary={setSummary}
      getCachedEntry={getCachedEntry}
      clearSummary={() => setSummary(null)}
    />
  );

  return (
    <>
      {summary ? renderComponent(Summary) : renderComponent(ActiveScreen)}
      <OverlayLoader display={displayLoader} />
    </>
  );
};

Screens.propTypes = {
  screens: PropTypes.array.isRequired,
  diagnoses: PropTypes.array.isRequired,
  script: PropTypes.object.isRequired,
  configuration: PropTypes.object,
  matches: PropTypes.array.isRequired,
};

export default Screens;
