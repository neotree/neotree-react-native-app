import { dbTransaction } from '../database';
import convertSessionsToExportable from './convertSessionsToExportable';
import * as nodeApi from '../nodeapi';
import updateSession from './updateSession';

export default (sessions) => new Promise((resolve, reject) => {
  (async () => {
    try {
      if (!sessions) sessions = await dbTransaction('select * from sessions where exported != ?;', [true]);

      const promises = [];
      const allSessions = sessions.map(s => ({ ...s, data: JSON.parse(s.data || '{}'), }));
      const completedSessions = allSessions.filter(s => s.data.completed_at);

      if (completedSessions.length) {
        const postData = await convertSessionsToExportable(completedSessions);
        postData.forEach((s, i) => promises.push(new Promise((resolve, reject) => {
          (async () => {
            try {
              await nodeApi.exportSession(s);
              const id = completedSessions[i].id;
              await updateSession({ exported: true }, { where: { id, }, });
            } catch (e) { console.log(e); return reject(e); }
            resolve();
          })();
        })));
      }

      if (allSessions.length) {
        const pollData = await convertSessionsToExportable(allSessions, { showConfidential: true, });
        pollData.forEach((s, i) => promises.push(new Promise((resolve, reject) => {
          (async () => {
            try {
              await nodeApi.exportPollData(s);
            } catch (e) { return reject(e); }
            resolve();
          })();
        })));
      }

      await Promise.all(promises);

      resolve();
    } catch (e) { reject(e); }
  })();
});
