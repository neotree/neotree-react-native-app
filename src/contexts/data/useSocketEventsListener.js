import React from 'react';
// import { onAuthStateChanged } from '@/api/auth';
import { startSocket } from '@/api/socket';

export default ({ sync }, params = []) => {
  sync = e => {
    require('@/utils/logger')('socket event', e);
    sync(e);
  };

  React.useEffect(() => {
    const socket = startSocket();
    // onAuthStateChanged(u => {
    //   sync({ name: 'authenticated_user', user: u });
    // });

    socket.on('create_scripts', data => sync({
      name: 'create_scripts',
      ...data
    }));
    socket.on('update_scripts', data => sync({
      name: 'update_scripts',
      ...data
    }));
    socket.on('delete_scripts', data => sync({
      name: 'delete_scripts',
      ...data
    }));
    socket.on('create_screens', data => sync({
      name: 'create_screens',
      ...data
    }));
    socket.on('update_screens', data => sync({
      name: 'update_screens',
      ...data
    }));
    socket.on('delete_screens', data => sync({
      name: 'delete_screens',
      ...data
    }));
  }, params);
};
