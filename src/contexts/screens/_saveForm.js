import { saveForm } from '@/api/forms';

export default ({
  setState,
  script,
  state: { form, activeScreen, start_time }
}) => (payload = {}) =>
  new Promise((resolve, reject) => {
    setState({ savingForm: true });

    const done = (err, rslts) => {
      setState({ savingForm: false });
      if (err) return reject(err);
      resolve(rslts);
    };

    saveForm({
      ...payload,
      data: {
        started_at: start_time,
        completed_at: payload.completed ? new Date() : null,
        canceled_at: payload.completed ? null : new Date(),
        script,
        form
      },
      script_id: activeScreen.script_id
    })
      .then(rslts => done(null, rslts))
      .catch(done);
  });
