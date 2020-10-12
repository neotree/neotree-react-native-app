import { sync as syncDatabase } from '@/api/database';

export default function sync(e, callback) {
  return new Promise((resolve, reject) => {
    const { authenticatedUser } = this.state;

    if (e) require('@/utils/logger')('socket event', JSON.stringify(e));

    this.setState({ syncingData: true, });

    const done = (syncError, syncRslts = {}) => {
      this.setState({
        syncingData: false,
        lastDataSyncEvent: e,
        syncError,
        ...(authenticatedUser ? null : { authenticatedUser: syncRslts.authenticatedUser, }),
      });

      if (callback) callback(syncError, syncRslts);

      if (syncError) {
        reject(syncError);
      } else {
        resolve(syncRslts);
      }      
    };

    syncDatabase({ socketEvent: e })
      .then(rslts => done(null, rslts))
      .catch(done);
  });
}
