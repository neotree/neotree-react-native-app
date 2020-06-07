import { getForms } from '@/api/forms';

export default ({ setState }) => () => {
  setState({ loadingData: true, loadDataError: null });
  getForms()
    .then(payload => {
      setState({
        data: payload.forms,
        loadingData: false,
        loadDataError: null
      });
    })
    .catch(loadDataError => setState({
      loadDataError,
      loadingData: false
    }));
};
