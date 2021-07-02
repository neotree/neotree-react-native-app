import io from 'socket.io-client';
import config from '@/constants/config';
import * as api from '../api';

const sockets = config.countries.reduce((acc, country) => {
  const webEditorHost = config[country] ? config[country].webeditor.host : null;
  const nodeApiHost = config[country] ? config[country].nodeapi.host : null;
  return {
    ...acc,
    ...(webEditorHost ? { [`${country}WebEditor`]: io(webEditorHost) } : null),
    ...(nodeApiHost ? { [`${country}NodeApi`]: io(nodeApiHost) } : null),
  };
}, {});

export function addSocketEventsListeners(country, listener) {
  const onEvent = e => setTimeout(() => listener && listener(e), 0);

  const webeditorSocket = sockets[`${country}WebEditor`];
  const nodeApiSocket = sockets[`${country}NodeApi`];

  if (webeditorSocket) {
    webeditorSocket.on('data_updated', data => onEvent({
      name: 'data_updated',
      ...data
    }));

    webeditorSocket.on('data_published', data => onEvent({
      name: 'data_published',
      ...data
    }));

    webeditorSocket.on('changes_discarded', data => onEvent({
      name: 'changes_discarded',
      ...data
    }));
  }

  if (nodeApiSocket) {
    nodeApiSocket.on('sessions_exported', data => {
      api.getExportedSessions().then(() => {}).catch(() => {}); // these will load all the exported sessions that are not on this device
      onEvent({
        name: 'sessions_exported',
        ...data
      });
    });
  }
}

export default sockets;
