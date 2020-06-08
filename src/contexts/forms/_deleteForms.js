import { deleteForms } from '@/api/forms';

export default ({ setState, state: { selectedItems, data } }) => () => {
  setState({ deletingForms: true, deleteFormsError: null });
  deleteForms(selectedItems.map(id => ({ id })))
    .then(() => {
      setState({
        selectedItems: [],
        data: data.filter(item => selectedItems.indexOf(item.id) < 0),
        canSelectItems: false,
        deletingForms: false,
        deleteFormsError: null
      });
    })
    .catch(deleteFormsError => setState({
      deleteFormsError,
      deletingForms: false
    }));
};
