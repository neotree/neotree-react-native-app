/* global alert */
import { saveSession } from '@/api/sessions';

export default function saveForm(payload = {}) {
  const { setState, router, } = this;

  return new Promise((resolve, reject) => {
    if (!payload.saveInBackground) setState({ savingForm: true });

    const done = (err, rslts = {}) => {
      const session = rslts.session;
      setState({ savingForm: false, session });
      if (payload.completed) router.history.push('/');
      if (err) return reject(err);
      resolve(session);      
    };

    saveSession(this.createSessionSummary(payload))
      .then(rslts => done(null, rslts))
      .catch(done);
  });
}
