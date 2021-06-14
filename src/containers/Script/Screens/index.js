import React from 'react';
import PropTypes from 'prop-types';
import OverlayLoader from '@/components/OverlayLoader';
import { useHistory, useLocation } from 'react-router-native';
import * as api from '@/api';
import { useAppContext } from '@/AppContext';
import ActiveScreen from './ActiveScreen';
import Summary from './Summary';

const Screens = props => {
  const { setState: setAppState, state: appState } = useAppContext();
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
  const [savedSession, setSavedSession] = React.useState(null);
  const [displayLoader, setDisplayLoader] = React.useState(false);

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
  const getCachedEntry = s => !s ? null : cachedEntries.filter(e => e.screen.id === s.screen_id)[0];

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
    appState,
    activeScreen,
    parseCondition,
    evaluateCondition,
    entries,
    diagnoses,
    script,
    startTime,
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

  const renderComponent = Component => (
    <Component
      {...props}
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
      activeScreenEntry={activeScreenEntry}
      summary={summary}
      savedSession={savedSession}
      activeScreen={activeScreen}
      createSessionSummary={createSessionSummary}
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
};

export default Screens;
