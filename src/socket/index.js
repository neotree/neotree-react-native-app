import io from 'socket.io-client';
import config from '@/constants/config';

const sockets = config.countries.reduce((acc, country) => {
  const host = config[country] ? config[country].webeditor.host : null;
  return { ...acc, ...(host ? { [country]: io(host) } : null) };
}, {});

export function addSocketEventsListeners(country, listener) {
  const socket = sockets[country];
  if (socket) {
    const onEvent = e => setTimeout(() => listener && listener(e), 0);

    socket.on('data_updated', data => onEvent({
      name: 'data_updated',
      ...data
    }));

    socket.on('data_published', data => onEvent({
      name: 'data_published',
      ...data
    }));

    socket.on('changes_discarded', data => onEvent({
      name: 'changes_discarded',
      ...data
    }));
  }
}

export default sockets;
