export default function getJSON(_sessions = [], opts = {}) {
  const { showConfidential } = opts;

  const sessions = _sessions.map(s => {
    const { script, form } = s.data;

    return {
      uid: s.uid,
      scriptTitle: script.script_id,
      script: { id: script.script_id, title: script.data.title },
      entries: form
        .map(e => ({
          ...e,
          values: e.values.filter(v => v.confidential ? showConfidential : true)
        }))
        .reduce((acc, e) => {
          const getVal = ({ value, dataType, type }) => {
            const t = dataType || type;
            switch (t) {
              case 'number':
                return Number(value) || null;
              case 'boolean':
                return value === 'false' ? false : Boolean(value);
              default:
                return value;
            }
          };

          return [
            ...acc,
            ...e.values.map(v => {
              const { key, type, dataType, value, label, valueLabel, exportValue, } = v;
              return {
                key,
                type: dataType || type,
                values: value && value.map ? 
                  value.map(({ value, label, valueLabel, exportValue, }) => ({ value: exportValue || value, label: valueLabel || label, })) 
                  : 
                  [{ value: exportValue || getVal(v), label: valueLabel || label, }],
              };
            })
          ];
        }, []),
    };
  });

  return sessions;
}