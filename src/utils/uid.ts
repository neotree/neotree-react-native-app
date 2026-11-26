import { getApplication } from '@/src/data';
import { generateDeviceHash } from '@/src/utils/generate-device-hash';
import { logError } from '@/src/utils/logError';
import { buildUid } from '@/src/utils/uid-counter';

export { validateUID } from '@/src/utils/uid-validate';

export async function generateUID(_scriptType?: string, idType: 'nuid' | 'muid' = 'nuid') {
    try {
        const { uid_prefix, total_sessions_recorded } = await getApplication();

        // https://neotree.atlassian.net/browse/NEOAPP-790?atlOrigin=eyJpIjoiZGY0NjQyYjk3NTg1NDVmY2I1YTgxNGZiMzk0OTNjYzkiLCJwIjoiaiJ9
        const extraDigits = generateDeviceHash('0123456789', 3);

        return buildUid({
            prefix: uid_prefix,
            counter: (total_sessions_recorded || 0) + 1,
            idType,
            extraDigits,
        });
    } catch(e: any) {
        alert('Failed to generate UID');
        logError('generateUID', e);
        return '';
    }
}
