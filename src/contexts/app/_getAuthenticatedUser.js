import { getAuthenticatedUser } from '@/api/auth';

export default ({ setState }) => (payload, opts = {}) => {
  setState({
    loadAuthenticatedUserError: null,
    loadingAuthenticatedUser: opts.showLoader !== false
  });

  getAuthenticatedUser({ ...payload })
    .then(payload => {
      setState({
        authenticatedUser: payload.user,
        authenticatedUserInitialised: true,
        loadAuthenticatedUserError: payload.error,
        loadingAuthenticatedUser: false,
      });
    })
    .catch(e => setState({
      loadAuthenticatedUserError: e,
      authenticatedUserInitialised: true,
      loadingAuthenticatedUser: false,
    }));
};
