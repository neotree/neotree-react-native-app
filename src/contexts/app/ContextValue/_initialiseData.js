import { createTablesIfNotExist } from '@/api/database';

export default function initialiseData() {
  createTablesIfNotExist()
    .catch(e => {
      require('@/utils/logger')('ERROR: createTablesIfNotExist', e);
      this.setState({ createTablesError: e });
    })
    .then(() => {
      this.getAuthenticatedUser();
    });
}
