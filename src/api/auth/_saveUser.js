import insertAuthenticatedUser from '../database/_insertAuthenticatedUser';
import { getLocalAuthenticatedUser } from './_getAuthenticatedUser';

export default user => new Promise((resolve, reject) => {
  insertAuthenticatedUser(user)
    .catch(reject)
    .then(() => getLocalAuthenticatedUser().catch(reject).then(resolve));
});
