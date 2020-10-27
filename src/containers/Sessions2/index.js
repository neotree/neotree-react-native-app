import React from 'react';
import { Alert, View } from 'react-native';
import { Switch, Route, useHistory, } from 'react-router-native';
import LazyPage from '@/components/LazyPage';
import * as api from '@/api';

const Sessions = LazyPage(() => import('./Sessions'));
const Session = LazyPage(() => import('./Session'));
const SessionsExport = LazyPage(() => import('./SessionsExport'));

const SessionsPage = () => {
  const history = useHistory();
  const [sessions, setSessions] = React.useState([]);
  const [loadingSessions, setLoadingSessions] = React.useState(false);

  const getSessions = (opts = {}) => new Promise((resolve, reject) => {
    const { loader } = opts;

    (async () => {
      setLoadingSessions((loader === undefined) || loader);
      try {
        const sessions = await api.getSessions();
        setSessions(sessions || []);
        resolve(sessions || []);
      } catch (e) {
        Alert.alert(
          'Failed to load sessions',
          e.message || e.msg || JSON.stringify(e),
          [
            {
              text: 'Cancel',
              onPress: () => history.push('/'),
              type: 'cancel',
            },
            {
              text: 'Try again',
              onPress: () => getSessions(),
            },
          ]
        );
        reject(e);
      }
      setLoadingSessions(false);
    })();
  });

  React.useEffect(() => { getSessions(); }, []);

  const getRouteRenderer = Component => params => {
    return (
      <>
        <Component
          {...params}
          sessions={sessions}
          setSessions={setSessions}
          getSessions={getSessions}
          loadingSessions={loadingSessions}
        />
      </>
    );
  }
  
  return (
    <>
      <View style={{ flex: 1 }}>
        <Switch>
          <Route exact path="/sessions/export" component={getRouteRenderer(SessionsExport)} />
          <Route exact path="/sessions/session/:sessionId" component={getRouteRenderer(Session)} />
          <Route path="*" component={getRouteRenderer(Sessions)} />
        </Switch>
      </View>
    </>
  );
};

export default SessionsPage;
