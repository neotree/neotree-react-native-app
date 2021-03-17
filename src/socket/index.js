import io from 'socket.io-client';
import Constants from 'expo-constants';
import { getLocation } from '@/api';

const config = Constants.manifest.extra;

const _socket = [];

export const connectSocket = country => new Promise((resolve, reject) => {
  try {
    const location = getLocation();
    if (!location) throw new Error('Location not set');

    country = country || location.country;

    const host = config[location.country] ? config[location.country].webeditor.host : null;
    if (!host) throw new Error('Api configuration not found');

    _socket[0] = (io(host));

    resolve(_socket[0]);
  } catch (e) { reject(e); }
});

export const socket = _socket[0];

export function addSocketEventsListeners(listener) {
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

export default socket;
