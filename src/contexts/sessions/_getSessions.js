import { getSessions } from '@/api/sessions';

export default ({ setState }) => () => {
  setState({ loadingSessions: true, loadSessionsError: null });
  getSessions()
    .then(payload => {
      setState({
        sessions: payload.sessions,
        loadingSessions: false,
        loadSessionsError: null
      });
    })
    .catch(loadSessionsError => setState({
      loadSessionsError,
      loadingSessions: false
    }));
};
