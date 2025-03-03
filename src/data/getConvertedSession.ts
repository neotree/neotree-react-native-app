import { APP_ENV, APP_VERSION } from '@/src/constants';
import { getApplication } from './queries';

export function formatExportableSession(session: any = {},opts: any = {}) {
    return new Promise((resolve, reject) => {
        (async () => {
            try {
            const { showConfidential } = opts;
            const application = await getApplication();
              const data = ()=>{
                const { script, form, app_mode, country, hospital_id, started_at, completed_at, canceled_at, unique_key, } = session.data;

                const diagnosisScreenEntry = form.filter((e: any) => e.screen.type === 'diagnosis')[0];
                const diagnoses = !diagnosisScreenEntry ? [] : diagnosisScreenEntry.values.map((v: any) => v.diagnosis);

                

                return {
                    uid: session.uid,
                    unique_key,
                    appVersion: APP_VERSION,
                    appEnv: APP_ENV,
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
                                        exportLabel,
                                        exportType,
                                        prePopulate
                                    } = v;

                                    if (value && value.map) {
                                        return [
                                            ...acc,
                                            {
                                                [key]: {
                                                    type: exportType || dataType || type,
													prePopulate: prePopulate || e.prePopulate || [],
                                                    values: value.reduce((acc: any, item: any) => {
														const { value, label, valueLabel, exportValue, exportLabel } = item;
														acc.label.push(exportLabel || valueLabel || label);
														acc.value.push(exportValue || value);
														return acc;
													}, { label: [], value: [], })
                                                }
                                            }
                                        ];
                                    }

                                    return [
                                        ...acc,
                                        {
                                            [key]: {
												type: exportType || dataType || type,
												prePopulate: prePopulate||e.prePopulate || [],
												values: {
                                                    label: [exportLabel || valueLabel || label],
                                                    value: [exportValue || getVal(v)]
                                                },
                                            }
                                        }
                                    ];
                                }, []),
                            ];
                        }, []).reduce((acc: any, e: any) => ({ ...acc, ...e }), {}),
                    }
                }
                
               resolve(data());
            } catch (e) { 
                reject(e); }
        })();
    });
}