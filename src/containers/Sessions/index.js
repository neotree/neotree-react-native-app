import React from 'react';
import { Alert, View } from 'react-native';
import moment from 'moment';
import { Switch, Route, useHistory, } from 'react-router-native';
import LazyPage from '@/components/LazyPage';
import * as api from '@/api';
import SessionsContext from './SessionsContext';

const Sessions = LazyPage(() => import('./Sessions'));
const Session = LazyPage(() => import('./Session'));
const SessionsExport = LazyPage(() => import('./SessionsExport'));

const SessionsPage = () => {
  const history = useHistory();
  const [sessions, setSessions] = React.useState([]);
  const [dbSessions, setDBSessions] = React.useState([]);
  const [loadingSessions, setLoadingSessions] = React.useState(false);
  const [filters, setFilters] = React.useState({});
  const [scriptsFields, setScriptsFields] = React.useState({});

  console.log(sessions);

  const getFilteredSessions = (sessions = dbSessions, _filters = filters) => {
    const filters = _filters;
    let _sessions = [...sessions];
    const getParsedDate = d => {
      d = moment(d).format('YYYY-MM-DD');
      return new Date(d).getTime();
    };

    if (filters.minDate) {
      _sessions = sessions.filter(s => getParsedDate(s.data.started_at) >= getParsedDate(filters.minDate));
    }
    if (filters.maxDate) {
      _sessions = sessions.filter(s => getParsedDate(s.data.started_at) <= getParsedDate(filters.maxDate));
    }
    return _sessions;
  };

  const getSessions = (opts = {}) => new Promise((resolve, reject) => {
    const { loader } = opts;

    (async () => {
      setLoadingSessions((loader === undefined) || loader);
      try {
        const sessions = await api.getSessions();
        setDBSessions(sessions || []);
        setSessions(getFilteredSessions(sessions || []));
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

  React.useEffect(() => {
    getSessions();
    (async () => {
      try {
        const fields = await api.getScriptsFields();
        setScriptsFields(fields);
      } catch (e) { console.log(e); /* DO NOTHING */ }
    })();
  }, []);
  
  return (
    <SessionsContext.Provider
      value={{
        sessions,
        filters,
        filterSessions: f => {
          setFilters(filters => ({ ...filters, ...f }));
          setSessions(getFilteredSessions(dbSessions, f));
        },
        clearFilters: () => setFilters({}),
        dbSessions,
        setSessions,
        getSessions,
        scriptsFields,
        loadingSessions,
      }}
    >
      <View style={{ flex: 1 }}>
        <Switch>
          <Route exact path="/sessions/export" component={SessionsExport} />
          <Route exact path="/sessions/session/:sessionId" component={Session} />
          <Route path="*" component={Sessions} />
        </Switch>
      </View>
    </SessionsContext.Provider>
  );
};

export default SessionsPage;
