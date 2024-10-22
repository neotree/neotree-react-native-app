import logger from "@/lib/logger";
import { getAxiosClient } from '@/lib/axios';
import { DataResponse, RemoteData } from "@/types";
import { isInternetConnected } from "@/lib/network";
import { useAsyncStorage } from "@/hooks/use-async-storage";
import * as mutations from "@/data/mutations";

type SyncRemoteDataOpts = {
    force?: boolean;
    clearData?: boolean;
};

export async function syncRemoteData({ 
    clearData = false, 
    ...options 
}: SyncRemoteDataOpts = {}) {
    try {
        const axios = await getAxiosClient();

        const {
            WEBEDITOR_DATA_VERSION,
            SESSIONS_COUNT,
            DEVICE_ID,
            LAST_REMOTE_SYNC_DATE,
            HOSPITAL_ID,
        } = await useAsyncStorage.getState().getAllItems();
        
        const hasInternet = await isInternetConnected();

        if (!hasInternet && !LAST_REMOTE_SYNC_DATE) throw new Error('No internet connection!');
        
        if (hasInternet) {
            const res = await axios.post<DataResponse<RemoteData>>(`/api/app/device/${DEVICE_ID}`, {
                lastSyncDate: LAST_REMOTE_SYNC_DATE,
                dataVersion: WEBEDITOR_DATA_VERSION,
                forceSync: options?.force,
                sessionsCount: Number(SESSIONS_COUNT || '0'),
                hospitalId: HOSPITAL_ID,
            });
            const { errors, data } = res.data;

            if (errors?.length) throw new Error(errors.join(', '));

            if (clearData) {
                await mutations.deleteAllScripts();
                await mutations.deleteAllScreens();
                await mutations.deleteAllDiagnoses();
            }

            logger.log('SYNC data.newData', data.newData);

            if (data.newData) {
                await mutations.deleteConfigKeys(data.configKeys.filter(c => c.isDeleted || c.deletedAt).map(c => c.configKeyId));
                await mutations.saveConfigKeys(data.configKeys.filter(c => !(c.isDeleted || c.deletedAt)));

                const { scripts, screens, diagnoses, } = data.scripts.reduce(
                    (acc, { screens, diagnoses, ...script }) => {
                        return {
                            ...acc,
                            scripts: [...acc.scripts, script],
                            screens: [...acc.screens, ...screens || []],
                            diagnoses: [...acc.diagnoses, ...diagnoses || []],
                        };
                    }, 
                    { scripts: [], screens: [], diagnoses: [], } as {
                        scripts: Omit<RemoteData['scripts'][0], 'screens' | 'diagnoses'>[];
                        screens: RemoteData['scripts'][0]['screens'];
                        diagnoses: RemoteData['scripts'][0]['diagnoses'];
                    }
                );

                await mutations.deleteScripts(scripts.filter(s => s.isDeleted || s.deletedAt).map(s => s.scriptId));
                await mutations.saveScripts(scripts.filter(s => !(s.isDeleted || s.deletedAt)));

                await mutations.deleteScreens(screens.filter(s => s.isDeleted || s.deletedAt).map(s => s.screenId));
                await mutations.saveScreens(screens.filter(s => !(s.isDeleted || s.deletedAt)));

                await mutations.deleteDiagnoses(diagnoses.filter(s => s.isDeleted || s.deletedAt).map(s => s.diagnosisId));
                await mutations.saveDiagnoses(diagnoses.filter(s => !(s.isDeleted || s.deletedAt)));

                // after syncing
                useAsyncStorage.getState().setItems({
                    LAST_REMOTE_SYNC_DATE: new Date().toUTCString(),
                    DEVICE_HASH: data?.deviceHash || '',
                    WEBEDITOR_DATA_VERSION: `${data?.dataVersion || ''}`,
                });
            }
        }
    } catch(e: any) {
        logger.log('syncRemoteData ERROR:', e.message);
        throw e;
    }
}