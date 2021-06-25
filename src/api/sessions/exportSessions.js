import { dbTransaction } from '../database';
import convertSessionsToExportable from './convertSessionsToExportable';
import * as nodeApi from '../nodeapi';
import updateSession from './updateSession';

export default () => new Promise((resolve, reject) => {
  (async () => {
    try {
      let sessions = await dbTransaction('select * from sessions where exported != ?;', [true]);
      sessions = sessions.map(s => ({ ...s, data: JSON.parse(s.data || '{}'), }));
      if (sessions.length) {
        const postData = await convertSessionsToExportable(sessions);
        try {
          await Promise.all(postData.map((s, i) => new Promise((resolve, reject) => {
            (async () => {
              try {
                await nodeApi.exportSession(s);
                const id = sessions[i].id;
                await updateSession({ exported: true }, { where: { id, }, });
              } catch (e) { console.log(e); return reject(e); }
              resolve();
            })();
          })));
        } catch (e) { reject(e); }
      }
    } catch (e) { reject(e); }
  })();
});
