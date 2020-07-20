import { getAuthenticatedUser } from '@/api/auth';
import { createTablesIfNotExist } from '@/api/database';

export default function initialiseData() {
  createTablesIfNotExist()
    .catch(e => {
      require('@/utils/logger')('ERROR: createTablesIfNotExist', e);
      this.setState({ createTablesError: e });
    })
    .then(() => {
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
    });
}
