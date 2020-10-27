import socket from '@/api/socket';

export default function addSocketEventsListeners(listener) {
  const onEvent = e => setTimeout(() => listener && listener(e), 0);

  socket.on('create_scripts', data => onEvent({
    name: 'create_scripts',
    ...data
  }));
  socket.on('update_scripts', data => onEvent({
    name: 'update_scripts',
    ...data
  }));
  socket.on('delete_scripts', data => onEvent({
    name: 'delete_scripts',
    ...data
  }));

  socket.on('create_screens', data => onEvent({
    name: 'create_screens',
    ...data
  }));
  socket.on('update_screens', data => onEvent({
    name: 'update_screens',
    ...data
  }));
  socket.on('delete_screens', data => onEvent({
    name: 'delete_screens',
    ...data
  }));

  socket.on('create_diagnoses', data => onEvent({
    name: 'create_diagnoses',
    ...data
  }));
  socket.on('update_diagnoses', data => onEvent({
    name: 'update_diagnoses',
    ...data
  }));
  socket.on('delete_diagnoses', data => onEvent({
    name: 'delete_diagnoses',
    ...data
  }));

  socket.on('create_config_keys', data => onEvent({
    name: 'create_config_keys',
    ...data
  }));
  socket.on('update_config_keys', data => onEvent({
    name: 'update_config_keys',
    ...data
  }));
  socket.on('delete_config_keys', data => onEvent({
    name: 'delete_config_keys',
    ...data
  }));
}
