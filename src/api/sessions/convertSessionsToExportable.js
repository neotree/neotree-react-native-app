import constants from '@/constants';
import { getApplication } from '../_application';

export default function convertSessionsToExportable(_sessions = [], opts = {}) {
  return new Promise((resolve, reject) => {
    (async () => {
      try {
        const application = await getApplication();

        const { showConfidential } = opts;

        const data = _sessions.map((s) => {
          const { script, form, app_mode, diagnoses, country, hospital_id } = s.data;

          return {
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
                  ...e.values.reduce((acc, v) => {
                    const {
                      key,
                      type,
                      dataType,
                      value,
                      label,
                      valueLabel,
                      exportValue,
                    } = v;

                    if (value && value.map) {
                      return [
                        ...acc,
                        {
                          [key]: {
                            type: dataType || type,
                            values: value.reduce((acc, { value, label, valueLabel, exportValue }) => ({
                              ...acc,
                              label: [...acc.label, valueLabel || label],
                              value: [...acc.value, exportValue || value]
                            }), { label: [], value: [], })
                          }
                        }
                      ];
                    }

                    return [
                      ...acc,
                      {
                        [key]: {
                          type: dataType || type,
                          values: {
                            label: [valueLabel || label],
                            value: [exportValue || getVal(v)]
                          },
                        }
                      }
                    ];
                  }, []),
                ];
              }, []).reduce((acc, e) => ({ ...acc, ...e }), {}),
          };
        });
        resolve(data);
      } catch (e) { reject(e); }
    })();
  });
}
