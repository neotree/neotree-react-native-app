import { signOut } from '@/api/auth';

export default function _signOut() {
  return new Promise((resolve, reject) => {
    this.setState({ signingOut: true });
    signOut()
      .catch(e => {        
        this.setState({ signingOut: false, signOutError: e, });
        this.router.history.entries = [];
        this.router.history.push('/sign-in');
        reject(e);
      })
      .then(res => {        
        this.setState({ signingOut: false, authenticatedUser: null, });
        resolve(res);
      });
  });
}
