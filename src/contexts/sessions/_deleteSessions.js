import { deleteSessions } from '@/api/sessions';

export default ({ setState, state: { selectedItems, session } }) => () => {
  setState({ deletingSessions: true, deleteSessionsError: null });
  deleteSessions(selectedItems.map(id => ({ id })))
    .then(() => {
      setState({
        selectedItems: [],
        session: session.filter(item => selectedItems.indexOf(item.id) < 0),
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
