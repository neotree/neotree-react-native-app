import makeApiCall from '../makeApiCall';

export const getScreen = options => makeApiCall('/get-screen', options);

export const getScreens = options => makeApiCall('/get-screens', options);
