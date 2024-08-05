import { APP_VERSION } from '@/src/constants';
import { convertSessionsToExportable } from '../../../data';

export default function getJSON(opts: any = {}) {
  const { showConfidential, sessions: _sessions, application } = opts;

  const sessions = (_sessions || []).map((s: any) => {
    const { script, app_mode, country, hospital_id, started_at, completed_at, canceled_at } = s.data;
    const { entries, diagnoses }: any = convertSessionsToExportable([s], { showConfidential });

    const data = {
      uid: s.uid,
      started_at,
      completed_at,
      canceled_at,
      appVersion: APP_VERSION,
      scriptVersion: application.webeditor_info.version,
      scriptTitle: script.script_id,
      script: { id: script.script_id, title: script.data.title },
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
      entries
    };

    return data;
  });

  return sessions;
}
