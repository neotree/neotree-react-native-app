import { dbTransaction } from './database/db';
import * as webeditorApi from './webeditor';

export async function shouldResetData() {
    try {
        const getApplicationRslt = await dbTransaction('select * from application where id=1;');
        if (!getApplicationRslt[0]) return false;
        const webEditor = await webeditorApi.getDeviceRegistration({ deviceId: getApplicationRslt[0].device_id });
        const webEditorLocal = JSON.parse(getApplicationRslt[0].webeditor_info);
        if (!webEditor) return false;
        return (getApplicationRslt[0].mode === 'production') && (webEditor.info.version !== webEditorLocal.version);
    } catch (e) { return false; /*throw e;*/ }
}
