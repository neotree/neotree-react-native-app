import makeApiCall from './makeApiCall';

export const getDiagnosis = (body = {}, reqOpts = {}) => makeApiCall('/get-diagnosis', {
    body,
    ...reqOpts,
});

export const getDiagnoses = (body = {}, reqOpts = {}) => makeApiCall('/get-diagnoses', {
    body,
    ...reqOpts,
});
