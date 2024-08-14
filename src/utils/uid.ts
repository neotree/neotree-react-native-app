import { getApplication } from '@/src/data';
import { generateDeviceHash } from '@/src/utils/generate-device-hash';

export function validateUID(value = '') {
    const [_firstHalf, _lastHalf] = (value || '').split('-');

    const firstHalfMaxLength = 4;
    const firstHalfMinLength = 4;
    const allowedFirstHalf = /^[a-fA-F0-9]*$/gi;
    const firstHalfHasForbiddenChars = !(allowedFirstHalf.test(_firstHalf));
    const firstHalfIsValid = (_firstHalf.length === firstHalfMaxLength) && !firstHalfHasForbiddenChars;

    const lastHalfMaxLength = 7; // value.length === 12 ? 7 : 4;
    const lastHalfMinLength = 4;
    const allowedLastHalf = value.length === 12 ? /^[a-fA-F0-9]*$/gi : /^[0-9]*$/gi;
    const lastHalfHasForbiddenChars = !(allowedLastHalf.test(_lastHalf));
    const lastHalfIsValid = (_lastHalf.length >= lastHalfMinLength) && (_lastHalf.length <= lastHalfMaxLength) && !lastHalfHasForbiddenChars;

    return {
        firstHalfMaxLength,
        firstHalfMinLength,
        lastHalfMaxLength,
        lastHalfMinLength,
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
