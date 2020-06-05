import makeApiCall from './makeApiCall';

export const getScript = options => makeApiCall('/get-script', options);

export const getScripts = options => makeApiCall('/get-scripts', options);
