import { APP_ENV, APP_VERSION } from '@/src/constants';
import { getApplication } from './queries';

export function formatExportableSession(session: any = {}, opts: any = {}) {
  return new Promise((resolve, reject) => {
    (async () => {
      try {
        const { showConfidential } = opts;
        const application = await getApplication();

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

        // Helper: convert repeatable item values
        const extractValueObject = (item: any) => {
          
          return Object.entries(item).reduce((acc, [k, v]) => {
            if (
              typeof v === 'object' &&
              v !== null &&
              'value' in v &&
              v.value
            ){
              const valObj = v as any;
              acc[k] = {
                value: valObj.exportValue ?? valObj.value,
                label: valObj.exportLabel ?? valObj.valueLabel ??  valObj.value?? '',
                printable: valObj.printable ?? true,
                prePopulate: valObj.prePopulate,
              };
            } else {
              if(v){
              acc[k] = v;
              }
            }
            return acc;
          }, {} as any);
        };

        // Process repeatables
        const repeatables: Record<string, any[]> = {};
        form.forEach((entry: any) => {
          const repeatablesGroup = entry.repeatables || {};
          Object.entries(repeatablesGroup as Record<string, any[]>).forEach( 
          
            ([repeatKey, repeatItems]) => {

            repeatables[repeatKey] = repeatables[repeatKey] || [];

            repeatItems.filter(it=>!!it.hasCollectionField).forEach((item: any) => {  
              repeatables[repeatKey].push({
                ...extractValueObject(item),
                id: item.id,
                createdAt: item.createdAt,
                requiredComplete: item.requiredComplete
              });
            });
          });
        });

        // Helper: process individual value
        const transformValue = (v: any, parentPrePopulate: any) => {
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
            comments,
          } = v;

          const valType = exportType || dataType || type;
          const common = {
            type: valType,
            comments: comments || [],
            prePopulate: prePopulate || parentPrePopulate || [],
          };

          if (Array.isArray(value)) {
            const multi = value.reduce(
              (acc: any, item: any) => {
                acc.label.push(item.exportLabel || item.valueLabel || item.label);
                acc.value.push(item.exportValue || item.value);
                return acc;
              },
              { label: [], value: [] }
            );
            return { [key]: { ...common, values: multi } };
          }

          const parsedValue =
            valType === 'number'
              ? Number(value) || null
              : valType === 'boolean'
              ? value === 'false' ? false : Boolean(value)
              : value;

          return {
            [key]: {
              ...common,
              values: {
                label: [exportLabel || exportLabel || valueLabel],
                value: [exportValue ?? parsedValue],
              },
            },
          };
        };

        // Process standard entries
        const flatEntries = form
          .map((entry: any) => ({
            ...entry,
            values: entry.values.filter((v: any) => (v.confidential ? showConfidential : true)),
          }))
          .flatMap((entry: any) =>
            entry.values.map((v: any) => transformValue(v, entry.prePopulate))
          )
          .reduce((acc: any, curr: any) => ({ ...acc, ...curr }), {});

        flatEntries.repeatables = repeatables;

        const exportData = {
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

        resolve(exportData);
      } catch (e) {
        reject(e);
      }
    })();
  });
}
