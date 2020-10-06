/* global alert */
import { saveSession } from '@/api/sessions';

export default function saveForm(payload = {}, session) {
  return new Promise((resolve, reject) => {
    const done = (err, rslts = {}) => {
      const session = rslts.session;
      this.setState({ session });
      if (err) return reject(err);
      resolve(session);      
    };

    saveSession(session || this.createSessionSummary(payload))
      .then(rslts => done(null, rslts))
      .catch(done);
  });
}
