import { APP_ENV, APP_VERSION } from '@/src/constants';
import { getApplication } from './queries';

export function formatExportableSession(session: any = {}, opts: any = {}) {
  return new Promise((resolve, reject) => {
    (async () => {
      try {
        const { showConfidential } = opts;
        const application = await getApplication();

        const data = () => {
          const {
            script,
            form,
            app_mode,
            country,
            hospital_id,
            started_at,
            completed_at,
            canceled_at,
            unique_key,
          } = session.data;

          const diagnosisScreenEntry = form.find((e: any) => e.screen.type === 'diagnosis');
          const diagnoses = diagnosisScreenEntry
            ? diagnosisScreenEntry.values.map((v: any) => v.diagnosis)
            : [];

          // Collect repeatables and group them by repeatKey
          const repeatables: Record<string, any[]> = {};

          form.forEach((entry: any) => {
            const repeatablesGroup = entry.repeatables || {};
            Object.entries(repeatablesGroup as Record<string, any[]>).forEach(
              ([repeatKey, repeatItems]) => {
                repeatables[repeatKey] = repeatables[repeatKey] || [];

                repeatItems.forEach((item: any) => {
                  const valueObj = Object.entries(item).reduce((acc, [k, v]) => {
                    if (typeof v === 'object' && v !== null && 'value' in v) {
                      const valObj = v as {
                        value: any;
                        label?: string;
                        valueLabel?: string;
                        exportValue?: any;
                        exportLabel?: string;
                        printable?: boolean;
                      };
                      acc[k] = {
                        value: valObj.exportValue ?? valObj.value,
                        label: valObj.exportLabel ?? valObj.label ?? valObj.valueLabel ?? '',
                        printable: valObj.printable ?? true,
                      };
                    } else {
                      acc[k] = v;
                    }
                    return acc;
                  }, {} as any);

                  repeatables[repeatKey].push({
                    ...valueObj,
                    id: item.id,
                    createdAt: item.createdAt,
                  });
                });
              }
            );
          });

          // Process standard form entries
          const flatEntries = form
            .map((e: any) => ({
              ...e,
              values: e.values.filter((v: any) => (v.confidential ? showConfidential : true)),
            }))
            .reduce((acc: any, e: any) => {
              const getVal = ({ value, dataType, type }: any) => {
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
                ...e.values.reduce((acc: any, v: any) => {
                  const {
                    key,
                    type,
                    dataType,
                    value,
                    label,
                    valueLabel,
                    exportValue,
                    exportLabel,
                    exportType,
                    prePopulate,
                    printable,
                  } = v;

                  if (value && Array.isArray(value)) {
                    return [
                      ...acc,
                      {
                        [key]: {
                          type: exportType || dataType || type,
                          prePopulate: prePopulate || e.prePopulate || [],
                          values: value.reduce(
                            (acc: any, item: any) => {
                              acc.label.push(item.exportLabel || item.valueLabel || item.label);
                              acc.value.push(item.exportValue || item.value);
                              return acc;
                            },
                            { label: [], value: [] }
                          ),
                        },
                      },
                    ];
                  }

                  return [
                    ...acc,
                    {
                      [key]: {
                        type: exportType || dataType || type,
                        prePopulate: prePopulate || e.prePopulate || [],
                        values: {
                          label: [exportLabel || valueLabel || label],
                          value: [exportValue || getVal(v)],
                        },
                        printable: printable ?? true,
                        label,
                      },
                    },
                  ];
                }, []),
              ];
            }, [])
            .reduce((acc: any, e: any) => ({ ...acc, ...e }), {});

          //Merge repeatables into entries
          flatEntries.repeatables = repeatables;

          return {
            uid: session.uid,
            unique_key,
            appVersion: APP_VERSION,
            appEnv: APP_ENV,
            scriptVersion: application.webeditor_info.version,
            scriptTitle: script.script_id,
            script: {
              id: script.script_id,
              title: script.data.title,
              type: script.type,
            },
            started_at,
            completed_at,
            canceled_at,
            app_mode,
            country,
            hospital_id,
            diagnoses: diagnoses.map((d: any) => ({
              [d.name]: {
                hcw_agree: d.how_agree,
                hcw_follow_instructions: d.hcw_follow_instructions,
                Suggested: d.suggested,
                Priority: d.priority,
                hcw_reason_given: d.hcw_reason_given,
              },
            })),
            entries: flatEntries,
          };
        };

        resolve(data());
      } catch (e) {
        reject(e);
      }
    })();
  });
}
