import io from 'socket.io-client';
import apiConfig from '~/config/neotree-webeditor-api.json';

export const startSocket = () => io(apiConfig.host);
