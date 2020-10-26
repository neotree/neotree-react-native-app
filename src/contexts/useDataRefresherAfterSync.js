import React from 'react';
// import { useAppContext } from '@/contexts/app';

export default function useDataRefresherAfterSync(eventType, cb) {
  // const { state: { lastDataSyncEvent }, setState: setDataContextState } = useAppContext();
  //
  // const events = [
  //   `create_${eventType}`,
  //   `delete_${eventType}`,
  //   `update_${eventType}`,
  //   eventType,
  // ];
  //
  // React.useEffect(() => {
  //   if (lastDataSyncEvent && lastDataSyncEvent &&
  //     events.indexOf(lastDataSyncEvent.name) > -1
  //   ) {
  //     if (cb) cb(lastDataSyncEvent);
  //     setDataContextState({ lastDataSyncEvent: null });
  //   }
  // }, [lastDataSyncEvent]);
}
