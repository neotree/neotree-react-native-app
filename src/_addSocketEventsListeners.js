import socket from '@/api/socket';

export default function addSocketEventsListeners(listener) {
  const onEvent = e => setTimeout(() => listener && listener(e), 0);

  socket.on('data_updated', data => onEvent({
    name: 'data_updated',
    ...data
  }));
}
