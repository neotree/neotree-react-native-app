import { getApplication } from '@/src/data';

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

export async function generateUID() {
    try {
        const { uid_prefix, total_sessions_recorded, } = await getApplication();
        const uid = `${uid_prefix}-${`000${(total_sessions_recorded || 0) + 1}`.slice(-4)}`;
        return uid;
    } catch(e: any) {
        alert('Failed to generate UID');
        console.log(e);
        return '';
    }
}
