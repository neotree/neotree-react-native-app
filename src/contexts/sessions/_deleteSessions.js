import { deleteSessions } from '@/api/sessions';

export default ({ setState, state: { sessions } }) => (ids = []) => {
  if (!(ids && ids.length)) return;

  setState({ deletingSessions: true, deleteSessionsError: null });
  
  deleteSessions(ids.map(id => ({ id })))
    .then(() => {
      setState({
        selectedItems: [],
        sessions: sessions.filter(item => ids.indexOf(item.id) < 0),
        canSelectItems: false,
        deletingSessions: false,
        deleteSessionsError: null
      });
    })
    .catch(deleteSessionsError => setState({
      deleteSessionsError,
      deletingSessions: false
    }));
};
