import makeApiCall from './makeApiCall';

export const exportSession = (_body = {}, reqOpts = {}) => {
  const { scriptId, uid, ...body } = _body;
  return makeApiCall(`/sessions?uid=${uid}&scriptId=${scriptId}`, {
    body,
    method: 'POST',
    ...reqOpts,
  });
};
