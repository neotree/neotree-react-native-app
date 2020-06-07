import insertAuthenticatedUser from '../_insertAuthenticatedUser';
import { getAuthenticatedUser } from '../../auth';

export default data => new Promise((resolve, reject) => {
  if (data && data.event && (data.event.name === 'authenticated_user')) {
    insertAuthenticatedUser(data.event.user)
      .catch(reject)
      .then(() => getAuthenticatedUser().catch(reject).then(resolve));
  } else {
    getAuthenticatedUser().catch(reject).then(resolve);
  }
});
