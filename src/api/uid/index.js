import { getDataStatus } from '../database/data_status';

export const getUID = () => new Promise((resolve, reject) => {
  (async () => {
    try {
      const { uid_prefix, total_sessions_recorded, } = await getDataStatus();
      resolve(`${uid_prefix}-${`000${total_sessions_recorded + 1}`.slice(-4)}`);
    } catch (e) { reject(e); }
  })();
});
