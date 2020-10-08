import db from '../database/db';

export default () => new Promise((resolve, reject) => {
  db.transaction(
    tx => {
      tx.executeSql(
        'select * from authenticated_user;',
        null,
        (tx, rslts) => {
          const user = rslts.rows._array[0];

          const details = (() => {
            if (!user) return null;

            try {
              return JSON.parse(user.details);
            } catch (e) {
              return null;
            }
          })();

          resolve({ user: details });
        },
        (tx, e) => {
          if (e) {
            require('@/utils/logger')('ERROR: getAuthenticatedUser', e);
            reject(e);
          }
        }
      );
    }
  );
});
