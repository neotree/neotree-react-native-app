import { getAuthenticatedUser } from '@/api/auth';

export default function _getAuthenticatedUser() {
  this.setState({ loadingAuthenticatedUser: true });

  getAuthenticatedUser()
    .then(({ user }) => {
      this.setState({
        authenticatedUser: user,
        loadingAuthenticatedUser: false,
        authenticatedUserInitialised: true,
      });
      if (user) this.sync();
    })
    .catch(e => this.setState({
      loadAuthenticatedUserError: e,
      loadingAuthenticatedUser: false,
      authenticatedUserInitialised: true,
    }));
}