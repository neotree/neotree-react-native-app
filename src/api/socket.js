import io from 'socket.io-client';
import Constants from 'expo-constants';

const config = Constants.manifest.extra;

const _socket = [];

export const connectSocket = country => new Promise((resolve, reject) => {
  try {
    const host = config[country] ? config[country].webeditor.host : null;
    if (!host) throw new Error('Api configuration not found');
    _socket[0] = (io(host));
    resolve(_socket[0]);
  } catch (e) { reject(e); }
});

export const socket = _socket[0];

export default _socket[0];
