import { dbTransaction } from '../data/db';
import { getLocation } from '../data/queries';
import * as Device from 'expo-device';
import * as Battery from 'expo-battery'
import { getAvailableDiskSpace } from './deviceInfo';


export async function handleAppCrush(error: any) {
    const stack = error.stack;
    const message = error.message;
    let app = await dbTransaction('select * from application where id=1;');
    let application = app[0];
    if (application) {
        let e = await dbTransaction(`select * from exceptions where message='${String(message).replace('\'', '')}'`);

        if (e && e.length > 0) {
            // ERROR ALREADY LOGGED, DO NOTHING
        } else {
            //RECORD THE ERROR
            const webApp = JSON.parse(application?.webeditor_info)
            const deviceType = await Device.getDeviceTypeAsync() == 2 ? 'TABLET' : 'PHONE';
            const batteryLevel = (await Battery.getBatteryLevelAsync() * 100)?.toPrecision(2)
            const model = 'MANUFACTURER: ' + Device.manufacturer + ' MODEL :' + Device.modelName + ' TYPE: ' + deviceType + ' OS VERSION: ' + Device.osVersion

            try {
                const columns = ['message', 'stack', 'device', 'exported', 'country', 'hospital', 'version', 'editor_version', 'battery', 'memory', 'device_model'].join(',');
                const values = ['?', '?', '?', '?', '?', '?', '?', '?', '?', '?', '?'].join(',');
                const location = await getLocation();

                const { totalSpace, freeSpace } = await getAvailableDiskSpace();
                await dbTransaction(`insert into exceptions (${columns}) values (${values});`, [
                    String(message).replace('\'', ''),
                    stack,
                    application.device_id,
                    false,
                    location?.country,
                    location?.hospital,
                    application?.version,
                    webApp?.version,
                    batteryLevel,
                    'AVAILABLE STORAGE:' + freeSpace + " GB" + " OF " + totalSpace + "GB",
                    model
                ]).then(res => {
                }).catch(e => {
                })
            } catch (ex) {
            }
        }
    }

}