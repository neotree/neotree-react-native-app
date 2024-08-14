import { getApplication } from '@/src/data';
import { generateDeviceHash } from '@/src/utils/generate-device-hash';

export function validateUID(value = '') {
    const allowedFirstHalf = /^[a-fA-F0-9]*$/gi;
    const allowedLastHalf = /^[0-9]*$/gi;
    const [_firstHalf, _lastHalf] = (value || '').split('-');

    const firstHalfHasForbiddenChars = !allowedFirstHalf.test(_firstHalf);
    const lastHalfHasForbiddenChars = !allowedLastHalf.test(_lastHalf);
    const firstHalfIsValid = (_firstHalf.length === 4) && !firstHalfHasForbiddenChars;
    const lastHalfIsValid = (_lastHalf.length === 4) && !lastHalfHasForbiddenChars;

    return {
        firstHalfHasForbiddenChars,
        lastHalfHasForbiddenChars,
        firstHalfIsValid,
        lastHalfIsValid,
        isValid: firstHalfIsValid && lastHalfIsValid,
    };
};

export async function generateUID(scriptType?: string) {
    try {
        const { uid_prefix, total_sessions_recorded, device_id } = await getApplication();

        // https://neotree.atlassian.net/browse/NEOAPP-790?atlOrigin=eyJpIjoiZGY0NjQyYjk3NTg1NDVmY2I1YTgxNGZiMzk0OTNjYzkiLCJwIjoiaiJ9
        let extraChars = '';
        if (scriptType === 'admission') extraChars = generateDeviceHash(device_id, 3);

        let suffix = `${`000${(total_sessions_recorded || 0) + 1}`.slice(-4)}`;
        suffix = [extraChars, suffix].join('');

        const uid = `${uid_prefix}-${suffix}`;

        return uid;
    } catch(e: any) {
        alert('Failed to generate UID');
        console.log(e);
        return '';
    }
}
