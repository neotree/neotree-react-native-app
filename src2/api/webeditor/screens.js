import makeApiCall from './makeApiCall';

export const getScreen = (body = {}, reqOpts = {}) => makeApiCall('/get-screen', {
    body,
    ...reqOpts,
});

export const getScreens = (body = {}, reqOpts = {}) => makeApiCall('/get-screens', {
    body,
    ...reqOpts,
});
