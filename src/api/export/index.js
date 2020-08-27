import makeApiCall from './makeApiCall';

export const exportSession = (body = {}, reqOpts = {}) => {
  const { script, uid, } = body;
  return makeApiCall(`/sessions?uid=${uid}&scriptId=${script.id}`, {
    body,
    method: 'POST',
    ...reqOpts,
  });
};
