import { getApplication } from '@/src/data';
import { generateDeviceHash } from '@/src/utils/generate-device-hash';

export function validateUID(value = '') {
    const [_firstHalf, _lastHalf] = (value || '').split('-');

    const firstHalfMaxLength = 4;
    const firstHalfMinLength = 4;
    const allowedFirstHalf = /^[a-fA-F0-9]*$/gi;
    const firstHalfHasForbiddenChars = !(allowedFirstHalf.test(_firstHalf));
    const firstHalfInvalidLength = !(_firstHalf.length === firstHalfMaxLength);
    const firstHalfIsValid = !firstHalfInvalidLength && !firstHalfHasForbiddenChars;

    const lastHalfMaxLength: number = 7; // value.length === 12 ? 7 : 4;
    const lastHalfMinLength: number = 7; // used to be 4: https://neotree.atlassian.net/browse/NEOAPP-949
    const allowedLastHalf = /^[0-9]*$/gi;
    const lastHalfHasForbiddenChars = !(allowedLastHalf.test(_lastHalf));
    const lastHalfInvalidLength = !((_lastHalf.length === lastHalfMinLength) || (_lastHalf.length === lastHalfMaxLength));
    const lastHalfIsValid = !lastHalfInvalidLength && !lastHalfHasForbiddenChars;

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
        lastHalfInvalidLength,
        firstHalfErrors: [
            ...(firstHalfHasForbiddenChars ? ['Allowed characters: 0123456789'] : []),
            ...(firstHalfInvalidLength ? [(firstHalfMaxLength === firstHalfMinLength) ? firstHalfMaxLength + ' characters required' : `${firstHalfMinLength} or ${firstHalfMaxLength} digits required`] : [])
        ],
        lastHalfErrors: [
            ...(lastHalfHasForbiddenChars ? ['Allowed characters: 0123456789'] : []),
            ...(lastHalfInvalidLength ? [(lastHalfMaxLength === lastHalfMinLength) ? lastHalfMaxLength + ' characters required' : `${lastHalfMinLength} or ${lastHalfMaxLength} digits required`] : [])
        ],
    };
};

export async function generateUID(scriptType?: string) {
    try {
        const { uid_prefix, total_sessions_recorded, device_id } = await getApplication();

        // https://neotree.atlassian.net/browse/NEOAPP-790?atlOrigin=eyJpIjoiZGY0NjQyYjk3NTg1NDVmY2I1YTgxNGZiMzk0OTNjYzkiLCJwIjoiaiJ9
        const extraChars = generateDeviceHash('0123456789', 3);

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
