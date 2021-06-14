import constants from '@/constants';

export default function getJSON(opts = {}) {
  const { showConfidential, sessions: _sessions, application } = opts;

  const sessions = (_sessions || []).map((s) => {
    const { script, form, app_mode, diagnoses, country, hospital_id } = s.data;

    const data = {
      uid: s.uid,
      appVersion: constants.APP_VERSION,
      scriptVersion: application.webeditor_info.version,
      scriptTitle: script.script_id,
      script: { id: script.script_id, title: script.data.title },
      app_mode,
      country,
      hospital_id,
      diagnoses: diagnoses.map(d => ({
        [d.name]: {
          hcw_agree: d.how_agree,
          hcw_follow_instructions: d.hcw_follow_instructions,
          Suggested: d.suggested,
          Priority: d.priority,
          hcw_reason_given: d.hcw_reason_given,
        }
      })),
      entries: form
        .map((e) => ({
          ...e,
          values: e.values.filter((v) =>
            v.confidential ? showConfidential : true
          ),
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
            ...e.values.map((v) => {
              const {
                key,
                type,
                dataType,
                value,
                label,
                valueLabel,
                exportValue,
              } = v;
              return {
                key,
                type: dataType || type,
                values:
                  value && value.map
                    ? value.map(
                      ({ value, label, valueLabel, exportValue }) => ({
                        value: exportValue || value,
                        label: valueLabel || label,
                      })
                    )
                    : [
                      {
                        value: exportValue || getVal(v),
                        label: valueLabel || label,
                      },
                    ],
              };
            }),
          ];
        }, []),
    };

    return data;
  });

  return sessions;
}
