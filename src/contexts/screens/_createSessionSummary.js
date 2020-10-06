export default function createSessionSummary(_payload = {}) {
  const {
    script,
    state: { form, activeScreen, start_time, screens, },
  } = this;

  const { completed, canceled, ...payload } = _payload;

  const uid = form.reduce((acc, { values }) => {
    const uid = values.reduce((acc, { key, value }) => {
      if (`${key}`.match(/uid/gi)) return value;
      return acc;
    }, null);

    return uid || acc;
  }, null);

  const sessionSummary = {
    ...payload,
    uid,
    script_id: activeScreen.script_id,
    data: {
      started_at: start_time,
      completed_at: completed ? new Date().toISOString() : null,
      canceled_at: canceled ? new Date().toISOString() : null,
      script,
      form,
      diagnoses: this.getDiagnoses(),
    },
  };

  return sessionSummary;
}
