import React from 'react';
import * as api from '@/api';
import { useParams, useHistory, useLocation, } from 'react-router-native';
import { View, Alert, } from 'react-native';
import OverlayLoader from '@/components/OverlayLoader';
import Context from './Context';
import Screens from './Screens';
import InitialiseDischargeForm from './InitialiseDischargeForm';

const Script = () => {
  const { scriptId } = useParams();
  const history = useHistory();
  const location = useLocation();

  const [state, _setState] = React.useState({
    matches: [],
    pageOptions: null,
    script: null,
    screens: [],
    diagnoses: [],
    configuration: null,
    autoFill: { uid: null, session: null },
    hideFloatingButton: false,
    autoFillInitialised: false,
  });
  const setState = s => _setState(prev => ({ ...prev, ...(typeof s === 'function' ? s(prev) : s) }));

  const [loadingScript, setLoadingScript] = React.useState(false);
  const [loadingScreens, setLoadingScreens] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);

  const refreshPage = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 50);
  }, []);

  React.useEffect(() => {
    history.entries = [];
    history.push(location.pathname);
  }, []);

  const getScript = React.useCallback(() => new Promise((resolve, reject) => {
    (async () => {
      setLoadingScript(true);
      try {
        const script = await api.getScript({ script_id: scriptId });
        setState({ script });
        resolve(script);
      } catch (e) {
        Alert.alert(
          'Failed to load script',
          e.message || e.msg || JSON.stringify(e),
          [
            {
              text: 'Try again',
              onPress: getScript,
            },
            {
              text: 'Exit',
              onPress: () => history.push('/'),
              style: 'cancel'
            },
          ]
        );
        reject(e);
      }
      setLoadingScript(false);
    })();
  }), []);

  const getScreens = React.useCallback(() => new Promise((resolve, reject) => {
    (async () => {
      setLoadingScreens(true);
      try {
        let screens = await api.getScreens({ script_id: scriptId });
        screens = screens || [];
        if (!screens.length) {
          Alert.alert(
            'No screens found',
            'Script does not have screens',
            [
              {
                text: 'Try again',
                onPress: getScreens,
              },
              {
                text: 'Exit',
                onPress: () => history.push('/'),
                style: 'cancel'
              },
            ]
          );
        }
        setState({ screens });
        resolve(screens || []);
      } catch (e) {
        Alert.alert(
          'Failed to load screens',
          e.message || e.msg || JSON.stringify(e),
          [
            {
              text: 'Try again',
              onPress: getScreens,
            },
            {
              text: 'Exit',
              onPress: () => history.push('/'),
              style: 'cancel'
            },
          ]
        );
        reject(e);
      }
      setLoadingScreens(false);
    })();
  }), []);

  React.useEffect(() => {
    (async () => {
      try {
        const config = await api.getConfiguration();
        setState({ configuration: config ? config.data : {} });
      } catch (e) { /* Do nothing */ }

      try {
        await getScript();
        await getScreens();
        let diagnoses = await api.getDiagnoses({ script_id: scriptId });
        diagnoses = diagnoses || [];
        setState({ diagnoses });
      } catch (e) { /* Do nothing */ }
    })();
  }, []);

  if (loadingScript || loadingScreens || refreshing) return <OverlayLoader display transparent />;

  if (!state.script) return null;

  return (
    <Context.Provider value={{ state, setState, }}>
      <View style={{ flex: 1 }}>
        <Screens
          script={state.script}
          screens={state.screens}
          diagnoses={state.diagnoses}
          configuration={state.configuration}
          autoFill={state.autoFill}
          matches={state.matches}
        />
      </View>

      {['discharge', 'neolab'].includes(state.script.type) && !state.autoFillInitialised && (
        <InitialiseDischargeForm
          type={state.script.type}
          onClose={(autoFill, matches = []) => {
            if (!autoFill.session) {
              setState({ autoFillInitialised: true, });
            } else {
              refreshPage();
              setState({ matches, autoFill, autoFillInitialised: true, });
            }
          }}
        />
      )}
    </Context.Provider>
  );
};

export default Script;
