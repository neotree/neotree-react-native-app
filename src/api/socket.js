import io from 'socket.io-client';
import { CONFIG } from '@/constants';

const socket = io(CONFIG.webeditorConfig.host);

export default socket;
