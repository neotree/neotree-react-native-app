import io from 'socket.io-client';

import { COUNTRY } from '../types';
import { getExportedSessions } from './sessions';
import { getLocation } from './queries';
import { APP_CONFIG } from '../constants';


const countries = (APP_CONFIG.countries || []) as COUNTRY[];

export const sockets: { [key: string]: any; } = countries.reduce((acc, country) => {
  const webEditorHost = APP_CONFIG[country?.iso]?.webeditor.host || null;
  const nodeApiHost = APP_CONFIG[country?.iso]?.nodeapi.host || null;
  return {
    ...acc,
    ...(webEditorHost ? { [`${country}WebEditor`]: io(webEditorHost) } : null),
    ...(nodeApiHost ? { [`${country}NodeApi`]: io(nodeApiHost) } : null),
  };
}, {});

export async function addSocketEventsListeners(listener: (e: any) => void) {
    try {
        const loc = await getLocation();
        const country = loc?.country;

        if (country) {
            const onEvent = (e: any) => setTimeout(() => listener && listener(e), 0);

            const webeditorSocket = sockets[`${country}WebEditor`];
            const nodeApiSocket = sockets[`${country}NodeApi`];

            if (webeditorSocket) {
                webeditorSocket.on('data_updated', (data: any) => onEvent({
                    name: 'data_updated',
                    ...data
                }));

                webeditorSocket.on('data_published', (data: any) => onEvent({
                    name: 'data_published',
                    ...data
                }));

                webeditorSocket.on('changes_discarded', (data: any) => onEvent({
                    name: 'changes_discarded',
                    ...data
                }));
            }

            if (nodeApiSocket) {
                nodeApiSocket.on('sessions_exported', (data: any) => {
                    getExportedSessions().then(() => {}).catch(() => {}); // these will load all the exported sessions that are not on this device
                    onEvent({
                    name: 'sessions_exported',
                    ...data
                    });
                });
            }
        }
    } catch(e) { 
        
        /**/ }
}
