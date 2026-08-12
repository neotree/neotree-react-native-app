import io from 'socket.io-client';

import { COUNTRY } from '../types';
import { getExportedSessions } from './sessions';
import { getLocation } from './queries';
import { resetCircuit, backendKey } from './circuitBreaker';
import { resumeExportSessions } from './exportSessions';
import { APP_CONFIG } from '../constants';


const countries = (APP_CONFIG.countries || []) as COUNTRY[];

const SOCKET_OPTS = {
  reconnectionDelay: 2000,
  reconnectionDelayMax: 30000,
  timeout: 15000,
};

export const sockets: { [key: string]: any; } = countries.reduce((acc, country) => {
  const webEditorHost = APP_CONFIG[country?.iso]?.webeditor.host || null;
  const nodeApiHost = APP_CONFIG[country?.iso]?.nodeapi.host || null;
  return {
    ...acc,
    ...(webEditorHost ? { [`${country.iso}WebEditor`]: io(webEditorHost, SOCKET_OPTS) } : null),
    ...(nodeApiHost ? { [`${country.iso}NodeApi`]: io(nodeApiHost, SOCKET_OPTS) } : null),
  };
}, {});

const noop = () => {};

export async function addSocketEventsListeners(listener: (e: any) => void): Promise<() => void> {
    try {
        const loc = await getLocation();
        const country = loc?.country;

        if (!country) return noop;

        const onEvent = (e: any) => setTimeout(() => listener && listener(e), 0);

        const webeditorSocket = sockets[`${country}WebEditor`];
        const nodeApiSocket = sockets[`${country}NodeApi`];

        
        const onWebeditorConnect = () => resetCircuit(backendKey(country, 'webeditor'));
        const onNodeApiConnect = () => {
            resetCircuit(backendKey(country, 'nodeapi'));
            resumeExportSessions();
        };
        const onDataUpdated = (data: any) => onEvent({ name: 'data_updated', ...data });
        const onDataPublished = (data: any) => onEvent({ name: 'data_published', ...data });
        const onChangesDiscarded = (data: any) => onEvent({ name: 'changes_discarded', ...data });
        const onSessionsExported = (data: any) => {
            getExportedSessions().then(() => {}).catch(() => {}); // these will load all the exported sessions that are not on this device
            onEvent({ name: 'sessions_exported', ...data });
        };

        if (webeditorSocket) {
            webeditorSocket.on('connect', onWebeditorConnect);
            webeditorSocket.on('data_updated', onDataUpdated);
            webeditorSocket.on('data_published', onDataPublished);
            webeditorSocket.on('changes_discarded', onChangesDiscarded);
        }

        if (nodeApiSocket) {
            nodeApiSocket.on('connect', onNodeApiConnect);
            nodeApiSocket.on('sessions_exported', onSessionsExported);
        }

        return () => {
            webeditorSocket?.off('connect', onWebeditorConnect);
            webeditorSocket?.off('data_updated', onDataUpdated);
            webeditorSocket?.off('data_published', onDataPublished);
            webeditorSocket?.off('changes_discarded', onChangesDiscarded);
            nodeApiSocket?.off('connect', onNodeApiConnect);
            nodeApiSocket?.off('sessions_exported', onSessionsExported);
        };
    } catch {
        return noop;
    }
}
