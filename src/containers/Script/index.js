import React from 'react';
import * as api from '@/api';
import { useParams, useHistory, useLocation, } from 'react-router-native';
import { View, Alert, } from 'react-native';
import OverlayLoader from '@/components/OverlayLoader';
import Screens from './Screens';
import InitialiseDischargeForm from './InitialiseDischargeForm';

const Script = () => {
  const { scriptId } = useParams();
  const history = useHistory();
  const location = useLocation();

  const [configuration, setConfiguration] = React.useState(null);

  const [script, setScript] = React.useState(null);
  const [loadingScript, setLoadingScript] = React.useState(false);

  const [screens, setScreens] = React.useState([]);
  const [loadingScreens, setLoadingScreens] = React.useState(false);

  const [diagnoses, setDiagnoses] = React.useState([]);

  const [autoFill, setAutoFill] = React.useState({ uid: null, session: null });

  React.useEffect(() => {
    history.entries = [];
    history.push(location.pathname);
  }, []);

  const getScript = React.useCallback(() => new Promise((resolve, reject) => {
    (async () => {
      setLoadingScript(true);
      try {
        const script = await api.getScript({ script_id: scriptId });
        setScript(script);
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
        setScreens(screens);
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
        setConfiguration(config ? config.data : {});
      } catch (e) { /* Do nothing */ }

      try { await getScript(); } catch (e) { /* Do nothing */ }

      try { await getScreens(); } catch (e) { /* Do nothing */ }

      api.getDiagnoses({ script_id: scriptId }).then(d => setDiagnoses(d || [])).catch(() => { /*Do nothing*/ });
    })();
  }, []);

  if (loadingScript || loadingScreens) return <OverlayLoader display transparent />;

  if (!script) return null;

  return (
    <>
      <View style={{ flex: 1 }}>
        <Screens
          script={script}
          screens={screens}
          diagnoses={diagnoses}
          configuration={configuration}
          autoFill={autoFill}
        />
      </View>

      {(script.type === 'discharge') && (
        <InitialiseDischargeForm onClose={(uid, session) => setAutoFill({ uid, session })} />
      )}
    </>
  );
};

export default Script;
