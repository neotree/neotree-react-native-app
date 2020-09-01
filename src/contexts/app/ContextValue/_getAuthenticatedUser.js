import { getAuthenticatedUser } from '@/api/auth';

export default function _getAuthenticatedUser() {
  return new Promise((resolve, reject) => {
    this.setState({ loadingAuthenticatedUser: true });
    
    getAuthenticatedUser()
    .then(({ user }) => {
      this.setState({
        authenticatedUser: user,
        loadingAuthenticatedUser: false,
        authenticatedUserInitialised: true,
      });
      if (user) {
        this.sync().then(resolve).catch(reject);
      } else {
        resolve(null);
      }
    })
    .catch(e => {
      this.setState({
        loadAuthenticatedUserError: e,
        loadingAuthenticatedUser: false,
        authenticatedUserInitialised: true,
      });
      reject(e);
    });
  });
}
