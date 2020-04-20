import makeApiCall from '../makeApiCall';

export const getScripts = options => makeApiCall('/get-scripts', options);
