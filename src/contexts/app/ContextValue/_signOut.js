import { signOut } from '@/api/auth';

export default function _signOut() {
  return new Promise((resolve, reject) => {
    this.setState({ signingOut: true });
    signOut()
      .catch(e => {
        reject(e);
        this.setState({ signingOut: false, signOutError: e, });
      })
      .then(res => {
        resolve(res);
        this.setState({ signingOut: false, authenticatedUser: null, });
      });
  });
}
