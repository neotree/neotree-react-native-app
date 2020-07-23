import io from 'socket.io-client';
import apiConfig from '~/config/neotree-webeditor-api.json';

const socket = io(apiConfig.host);

export default socket;
