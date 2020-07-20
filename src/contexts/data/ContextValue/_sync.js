import { syncDatabase } from '@/api/database';

export default function sync(e, callback) {
  const { acceptedEvents } = this.state;

  if (e) {
    if (acceptedEvents.indexOf(e.key) > -1) return;
    require('@/utils/logger')('socket event', JSON.stringify(e));
  }

  // const u = e && e.name === 'authenticated_user' ? e.user : authenticatedUser;
  this.setState({
    syncingData: true,
    ...(e ? { acceptedEvents: [...acceptedEvents, e.key] } : null),
    // authenticatedUser: u,
  });

  const done = (syncError, syncRslts = {}) => {
    if (callback) callback(syncError, syncRslts);

    this.setState({
      syncingData: false,
      lastDataSyncEvent: e,
      syncError,
      dataStatus: syncRslts.dataStatus,
      authenticatedUser: syncRslts.authenticatedUser,
      authenticatedUserInitialised: true,
    });
  };

  syncDatabase({ event: e })
    .then(rslts => done(null, rslts))
    .catch(done);
}
