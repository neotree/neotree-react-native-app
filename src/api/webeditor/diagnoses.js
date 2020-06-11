import makeApiCall from './makeApiCall';

export const getDiagnosis = options => makeApiCall('/get-diagnosis', options);

export const getDiagnoses = options => makeApiCall('/get-diagnoses', options);
