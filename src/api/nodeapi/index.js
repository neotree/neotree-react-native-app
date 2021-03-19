import makeApiCall from './makeApiCall';

export const exportSession = (body = {}, reqOpts = {}) => {
  const { script, uid, } = body;
  return makeApiCall.post(`/sessions?uid=${uid}&scriptId=${script.id}`, {
    body,
    ...reqOpts,
  });
};

export const countSessionsWithUidPrefix = (body = {}, reqOpts = {}) => {
  return makeApiCall.get('/sessions/count-by-uid-prefix', {
    body,
    ...reqOpts,
  });
};
