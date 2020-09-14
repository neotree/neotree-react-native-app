import { createTablesIfNotExist } from '@/api/database';

export default function initialiseData() {
  return new Promise((resolve, reject) => {
    this.setState({ initialisingData: true });

    createTablesIfNotExist()
      .catch(e => {
        require('@/utils/logger')('ERROR: createTablesIfNotExist', e);
        this.setState({ createTablesError: e, initialisingData: false, });
        reject(e);
      })
      .then(() => {
        const done = (e, res) => {
          this.setState({ initialisingData: false, });
          if (e) { 
            reject(e);
          } else {
            resolve(res);
          }
        };

        this.getAuthenticatedUser()
          .then(res => done(null, res))
          .catch(done);
      });
  });
}
