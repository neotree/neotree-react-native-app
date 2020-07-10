import { getSessions } from '@/api/sessions';

export default ({ setState }) => () => {
  setState({ loadingSessions: true, loadSessionsError: null });
  getSessions()
    .then(res => {
      setState({
        sessions: res.sessions,
        loadingSessions: false,
        loadSessionsError: null
      });
    })
    .catch(loadSessionsError => setState({
      loadSessionsError,
      loadingSessions: false
    }));
};
