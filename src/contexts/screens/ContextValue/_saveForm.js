/* global alert */
import { saveSession } from '@/api/sessions';

export default function saveForm(_payload = {}) {
  const {
    setState,
    script,
    router,
    saveScriptStats,
    state: { form, activeScreen, start_time, screens }
  } = this;

  const { completed, canceled, saveInBackground, ...payload } = _payload;
  return new Promise((resolve, reject) => {
    if (!saveInBackground) setState({ savingForm: true });

    const done = (err, rslts = {}) => {
      const session = rslts.session;
      setState({ savingForm: false, session });
      if (err) return reject(err);
      resolve(session);
      if (completed) {
        if (!session) return alert('Oops, failed to retrieve saved session');
        router.history.push(`/script/${script.id}/preview-form`);
      }
    };

    saveScriptStats(stats => ({
      completed_sessions: stats.completed_sessions + (completed ? 1 : 0),
      incompleted_sessions: stats.incompleted_sessions + (completed ? 0 : 1),
      total_sessions: stats.total_sessions + 1,
    }));

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
