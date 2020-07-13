import makeApiCall from './makeApiCall';

export const getScript = (body = {}, reqOpts = {}) => makeApiCall('/get-script', {
    body,
    ...reqOpts,
});

export const getScripts = (body = {}, reqOpts = {}) => makeApiCall('/get-scripts', {
    body,
    ...reqOpts,
});
