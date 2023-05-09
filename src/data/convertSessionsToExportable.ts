import Constants from 'expo-constants';
import { getApplication } from './queries';
export function convertSessionsToExportable(_sessions: any[] = [], opts: any = {}) {
    return new Promise((resolve, reject) => {
        (async () => {
            try {
            const application = await getApplication();

            const { showConfidential } = opts;

            const data = _sessions.map((s: any) => {
                const { script, form, app_mode, country, hospital_id, started_at, completed_at, canceled_at, unique_key, } = s.data;

                const diagnosisScreenEntry = form.filter((e: any) => e.screen.type === 'diagnosis')[0];
                const diagnoses = !diagnosisScreenEntry ? [] : diagnosisScreenEntry.values.map((v: any) => v.diagnosis);

                return {
                    uid: s.uid,
                    unique_key,
                    appVersion: Constants.manifest?.extra?.APP_VERSION,
                    scriptVersion: application.webeditor_info.version,
                    scriptTitle: script.script_id,
                    script: { id: script.script_id, title: script.data.title, type: script.type, },
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
                        }
                    })),
                    entries: form
                        .map((e: any) => ({
                            ...e,
                            values: e.values.filter((v: any) =>
                                v.confidential ? showConfidential : true
                            ),
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
                                    } = v;

                                    if (value && value.map) {
                                        return [
                                            ...acc,
                                            {
                                                [key]: {
                                                    type: dataType || type,
                                                    values: value.reduce((acc: any, { value, label, valueLabel, exportValue }: any) => ({
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
                        }, []).reduce((acc: any, e: any) => ({ ...acc, ...e }), {}),
                    };
                });
                resolve(data);
            } catch (e) { 
                reject(e); }
        })();
    });
}
