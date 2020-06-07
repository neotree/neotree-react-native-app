import createTablesIfNotExist from '../_createTablesIfNotExist';
import insertAuthenticatedUser from '../_insertAuthenticatedUser';
import { getAuthenticatedUser } from '../../auth';
import { getLog } from '../logs';

export const authUserInit = data => new Promise((resolve, reject) => {
  if (data && data.event && (data.event.name === 'authenticated_user')) {
    insertAuthenticatedUser(data.event.user)
      .catch(reject)
      .then(() => getAuthenticatedUser().catch(reject).then(resolve));
  } else {
    getAuthenticatedUser().catch(reject).then(resolve);
  }
});

export default data => new Promise((resolve, reject) => {
  createTablesIfNotExist()
    .catch(reject)
    .then(() => {
      Promise.all([
        authUserInit(data),
        getLog({ name: 'init_data' }),
      ])
        .catch(reject)
        .then(([authenticated, dbInitLog]) => {
          resolve({
            authenticated,
            dbInitLog: dbInitLog && dbInitLog.log
          });
        });
    });
});
