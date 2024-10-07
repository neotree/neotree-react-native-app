import { io } from 'socket.io-client';

import { APP_CONFIG } from '../constants';

const sockets = APP_CONFIG.countries.reduce((acc: any, c: any) => ({
    ...acc,
    [c.iso]: io(APP_CONFIG[c.iso]),
}), {}) as { [key: string]: ReturnType<typeof io> };

export default sockets;
