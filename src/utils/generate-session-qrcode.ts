import * as FileSystem from 'expo-file-system';
import RNQRGenerator from 'rn-qr-generator';

import { reportErrors } from '@/src/data';

export async function generateQRCode({ session }: {
    session: any;
}) {
    try {
        const res = await RNQRGenerator.generate({
            value: session ? session['uid'] ? session['uid'] : "NO-SESSION" : "NO-UID",
            height: 80,
            width: 80,
            correctionLevel: 'H',
        });

        const uri =  res?.uri;

        if(uri) {
            const base64 = await FileSystem.readAsStringAsync(uri, {
                encoding: FileSystem.EncodingType.Base64,
            });
            return  "data:image/png;base64,"+base64
        }else{
            return '';
        }
    } catch(e: any) {
        reportErrors("QR_CODE_GENERATOR", e);
        return ''
    }
}
