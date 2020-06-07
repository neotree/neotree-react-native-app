import React from 'react';
import Typography from '@/ui/Typography';
import Divider from '@/ui/Divider';
import Button from '@/ui/Button';
import { LayoutCard } from '@/components/Layout';
import {
  describeTables,
  resetTables,
  getLocalDataActivityInfo,
  getRemoteDataActivityInfo,
  syncDatabase,
} from '@/api/database';
import { useOverlayLoaderState } from '@/contexts/app';

import * as firebase from 'firebase';

const Debug = () => {
  const [activities, _setActivities] = React.useState({});
  const setActivities = s => _setActivities(activities => ({ ...activities, ...s }));

  const disableAll = Object.keys(activities).reduce((acc, key) => {
    if (activities[key]) acc = true;
    return acc;
  }, false);

  useOverlayLoaderState('debug', disableAll);

  return (
    <>
      <LayoutCard style={{ flex: 1 }}>
        <Divider spacing={2} border={false} />

        <Typography variant="h1">Debug</Typography>

        <Divider spacing={2} border={false} />

        <Typography variant="h3">Database</Typography>

        <Divider border={false} />

        <Button
          disabled={disableAll || activities.LOG_TABLES_DESCRIPTION}
          color="disabled"
          variant="outlined"
          onPress={() => {
            setActivities({ LOG_TABLES_DESCRIPTION: true });
            const done = (e, rslts) => {
              setActivities({ LOG_TABLES_DESCRIPTION: false });
              require('@/utils/logger')(
                `${e ? 'Error: ' : ''}Log tables description`.toUpperCase(),
                JSON.stringify(rslts)
              );
            };
            describeTables()
              .then(rslts => done(null, rslts))
              .catch(done);
          }}
        >Log tables description</Button>

        <Divider border={false} />

        <Button
          disabled={disableAll || activities.LOG_LOCAL_DATA_INFO}
          color="disabled"
          variant="outlined"
          onPress={() => {
            setActivities({ LOG_LOCAL_DATA_INFO: true });
            const done = (e, rslts) => {
              setActivities({ LOG_LOCAL_DATA_INFO: false });
              require('@/utils/logger')(
                `${e ? 'Error: ' : ''}Log local data info`.toUpperCase(),
                JSON.stringify(rslts)
              );
            };
            getLocalDataActivityInfo()
              .then(rslts => done(null, rslts))
              .catch(done);
          }}
        >Log local data info</Button>

        <Divider border={false} />

        <Button
          disabled={disableAll || activities.LOG_WEBEDITOR_DATA_INFO}
          color="disabled"
          variant="outlined"
          onPress={() => {
            setActivities({ LOG_WEBEDITOR_DATA_INFO: true });
            const done = (e, rslts) => {
              setActivities({ LOG_WEBEDITOR_DATA_INFO: false });
              require('@/utils/logger')(
                `${e ? 'Error: ' : ''}Log webeditor data info`.toUpperCase(),
                JSON.stringify(rslts)
              );
            };
            getRemoteDataActivityInfo()
              .then(rslts => done(null, rslts))
              .catch(done);
          }}
        >Log webeditor data info</Button>

        <Divider border={false} />

        <Button
          disabled={disableAll || activities.LOG_RESET_TABLES}
          color="disabled"
          variant="outlined"
          onPress={() => {
            setActivities({ LOG_RESET_TABLES: true });
            const done = (e, rslts) => {
              setActivities({ LOG_RESET_TABLES: false });
              require('@/utils/logger')(
                `${e ? 'Error: ' : ''}Reset tables`.toUpperCase(),
                JSON.stringify(rslts)
              );
            };
            resetTables()
              // .then(rslts => done(null, rslts))
              .then(() => {
                syncDatabase({ event: { name: 'authenticated_user', user: firebase.auth().currentUser } })
                  .then(rslts => done(null, rslts))
                  .catch(done);
              })
              .catch(done);
          }}
        >Reset tables</Button>

        <Divider border={false} />

        <Button
          disabled={disableAll || activities.SYNC_DATA}
          color="disabled"
          variant="outlined"
          onPress={() => {
            setActivities({ SYNC_DATA: true });
            const done = (e, rslts) => {
              setActivities({ SYNC_DATA: false });
              require('@/utils/logger')(
                `${e ? 'Error: ' : ''}Sync data`.toUpperCase(),
                JSON.stringify(rslts)
              );
            };
            syncDatabase()
              .then(rslts => done(null, rslts))
              .catch(done);
          }}
        >Sync data</Button>
      </LayoutCard>
    </>
  );
};

export default Debug;
