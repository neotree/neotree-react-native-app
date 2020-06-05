import React from 'react';
import { useDataContext } from '@/contexts/data';

export default function useDataRefresherAfterSync(eventType, cb) {
  const { state: { lastDataSync }, setState: setDataContextState } = useDataContext();

  const events = [
    `create_${eventType}`,
    `delete_${eventType}`,
    `update_${eventType}`,
    eventType,
  ];

  React.useEffect(() => {
    if (lastDataSync && lastDataSync.event &&
      events.indexOf(lastDataSync.event.name) > -1
    ) {
      if (cb) cb(lastDataSync);
      setDataContextState({ lastDataSync: null });
    }
  }, [lastDataSync]);
}
