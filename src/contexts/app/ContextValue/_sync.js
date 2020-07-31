import { syncDatabase } from '@/api/database';

export default function sync(e, callback) {
  return new Promise((resolve, reject) => {
    const { acceptedEvents } = this.state;

    if (e) {
      if (acceptedEvents.indexOf(e.key) > -1) return;
      require('@/utils/logger')('socket event', JSON.stringify(e));
    }

    this.setState({
      syncingData: true,
      ...(e ? { acceptedEvents: [...acceptedEvents, e.key] } : null),
    });

    const done = (syncError, syncRslts = {}) => {
      this.setState({
        syncingData: false,
        lastDataSyncEvent: e,
        syncError,
        dataStatus: syncRslts.dataStatus,
        uid_prefix: syncRslts.dataStatus ? syncRslts.dataStatus.uid_prefix : null,
      });

      if (syncError) {
        reject(syncError);
      } else {
        resolve(syncRslts);
      }

      if (callback) callback(syncError, syncRslts);
    };

    syncDatabase({ event: e })
      .then(rslts => done(null, rslts))
      .catch(done);
  });
}
