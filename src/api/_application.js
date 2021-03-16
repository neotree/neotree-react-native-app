import { dbTransaction } from '../../src2/api/database/db';

export const getApplication = () => new Promise((resolve, reject) => {
  (async () => {
    try {
      let application = await dbTransaction('select * from application where id=1;');
      application = application[0];
      if (application) application.webeditor_info = JSON.parse(application.webeditor_info || '{}');
      resolve(application);
    } catch (e) { reject(e); }
  })();
});
