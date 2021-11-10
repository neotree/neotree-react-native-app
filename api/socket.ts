import io from 'socket.io-client';
import { ENV } from '@/constants';
import { sync } from '@/api/_sync';
import { getExportedSessions } from '@/api/nodeapi';

const sockets = ENV.countries.reduce((acc, country) => {
  const webEditorHost = country.webeditor.host;
  const nodeApiHost = country.nodeapi.host;
  return {
    ...acc,
    ...(webEditorHost ? { [`${country.country_code}WebEditor`]: io(webEditorHost) } : null),
    ...(nodeApiHost ? { [`${country.country_code}NodeApi`]: io(nodeApiHost) } : null),
  };
}, {});

export type SocketEvent<T = {}> = T & { name: string };

export function addSocketEventsListeners(country, listener: (socketEvent: SocketEvent) => void) {
  const onEvent = e => setTimeout(() => listener && listener(e as SocketEvent), 0);

  const webeditorSocket = sockets[`${country}WebEditor`];
  const nodeApiSocket = sockets[`${country}NodeApi`];

  if (webeditorSocket) {
    webeditorSocket.on('data_updated', data => {
      // console.log('data_updated', data);
      sync()
        .then(() => onEvent({
          name: 'data_updated',
          ...data
        }))
        .catch(() => {});
    });

    webeditorSocket.on('data_published', data => {
      // console.log('data_published', data);
      sync({ resetData: true, })
        .then(() => onEvent({
          name: 'data_published',
          ...data
        }))
        .catch(() => {});
    });

    webeditorSocket.on('changes_discarded', data => {
      // console.log('changes_discarded', data);
      sync({ resetData: true, })
        .then(() => onEvent({
          name: 'changes_discarded',
          ...data
        }))
        .catch(() => {});
    });
  }

  if (nodeApiSocket) {
    nodeApiSocket.on('sessions_exported', data => {
      console.log('sessions_exported', data);
      getExportedSessions().then(() => {}).catch(() => {}); // these will load all the exported sessions that are not on this device
      onEvent({
        name: 'sessions_exported',
        ...data
      });
    });
  }
}

export default sockets;
