import { saveSession } from '@/api/sessions';

export default ({
  setState,
  script,
  router,
  state: { form, activeScreen, start_time }
}) => (_payload = {}) => {
  const { completed, canceled, saveInBackground, ...payload } = _payload;
  return new Promise((resolve, reject) => {
    if (!saveInBackground) setState({ savingForm: true });

    const done = (err, rslts) => {
      if (!saveInBackground) setState({ savingForm: false });
      if (err) return reject(err);
      resolve(rslts);
      if (completed) router.history.push(`/script/${script.id}/preview-form`);
    };

    saveSession({
      ...payload,
      data: {
        started_at: start_time,
        completed_at: completed ? new Date() : null,
        canceled_at: canceled ? new Date() : null,
        script,
        form
      },
      script_id: activeScreen.script_id
    })
      .then(rslts => done(null, rslts))
      .catch(done);
  });
};
