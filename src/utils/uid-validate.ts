/** Checks of the NUID format (FB8E-1230042). Pure, so it can be unit tested. */
export function validateUID(value = '') {
    const [_firstHalf = '', _lastHalf = ''] = (value || '').split('-');

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
