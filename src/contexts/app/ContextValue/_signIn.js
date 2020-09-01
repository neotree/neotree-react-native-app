import { signIn } from '@/api/auth';

export default function _signIn(form) {
  return new Promise((resolve, reject) => {
    this.setState({ signingIn: true });

    const _reject = e => {
      reject(e);
      this.setState({ signingIn: false, signInError: e, });
    };

    signIn(form)
      .catch(_reject)
      .then(u => {
        this.setState({ signingIn: false, authenticatedUser: u, });
        this.initialiseApp();
        resolve(u);
      });
  });
}
