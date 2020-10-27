import * as api from '@/api';

export default ({ createSessionSummary, }) => function saveSession(payload) {
  return new Promise((resolve, reject) => {
    const done = (err, rslts = {}) => {
      const session = rslts.session;
      this.setState({ session });
      if (err) return reject(err);
      resolve(session);
    };

    api.saveSession(createSessionSummary(payload))
      .then(rslts => done(null, rslts))
      .catch(done);
  });
};
