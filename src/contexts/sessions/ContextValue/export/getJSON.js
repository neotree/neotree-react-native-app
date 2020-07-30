export default function exportToApi(_sessions = []) {
  const sessions = _sessions.map(s => {
    const { script, form } = s.data;

    return {
      uid: s.uid,
      scriptId: script.id,
      script: { id: script.id, title: script.data.title },
      entries: form.reduce((acc, e) => {
        return [
          ...acc,
          ...e.values.map(({ key, dataType, value, label, }) => ({
            key,
            type: dataType,
            values: [{ value, label }],
          }))
        ];
      }, []),
    };
  });

  return sessions.map(({ uid, scriptId, ...data }) => ({
    uid,
    scriptId,
    data,
  }));
}
