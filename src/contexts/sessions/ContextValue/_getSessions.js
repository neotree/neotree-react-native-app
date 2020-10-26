import { getSessions } from '@/api/sessions';

export default function _getSessions() {
  this.setState({ loadingSessions: true, loadSessionsError: null });
  getSessions()
    .then(res => {
      this.setState({
        sessions: res || [],
        loadingSessions: false,
        loadSessionsError: null
      });
    })
    .catch(loadSessionsError => this.setState({
      loadSessionsError,
      loadingSessions: false
    }));
}
