import { saveSession } from '@/api/sessions';

export default function saveForm(_payload = {}) {
  const {
    setState,
    script,
    router,
    state: { form, activeScreen, start_time, screens }
  } = this;

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
        completed_at: completed ? new Date().toString() : null,
        canceled_at: canceled ? new Date().toString() : null,
        script,
        form,
        diagnoses: this.getDiagnoses(),
        screens: screens.map(s => {
          const { fields, items } = { ...s.data.metadata };
          return {
            id: s.id,
            type: s.type,
            metadata: { key: s.data.metadata.key },
            fields: (fields || []).map(f => ({ key: f.key })),
            items: (items || []).map(f => ({ key: f.key || f.id })),
          };
        })
      },
      script_id: activeScreen.script_id
    })
      .then(rslts => done(null, rslts))
      .catch(done);
  });
}
