import constants from '@/constants';
import { convertSessionsToExportable } from '@/api';

export default function getJSON(opts = {}) {
  const { showConfidential, sessions: _sessions, application } = opts;

  const sessions = (_sessions || []).map((s) => {
    const { script, app_mode, country, hospital_id } = s.data;
    const { entries, diagnoses } = convertSessionsToExportable([s], { showConfidential });

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
      entries
    };

    return data;
  });

  return sessions;
}
