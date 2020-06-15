import { saveSession } from '@/api/sessions';

export default ({
  setState,
  script,
  router,
  state: { form, activeScreen, start_time }
}) => (payload = {}) =>
  new Promise((resolve, reject) => {
    setState({ savingForm: true });

    const done = (err, rslts) => {
      setState({ savingForm: false });
      if (err) return reject(err);
      resolve(rslts);
      if (payload.completed) router.history.push(`/script/${script.id}/preview-form`);
    };

    saveSession({
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
