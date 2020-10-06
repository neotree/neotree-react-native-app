import {
  insertEhrSession as _insertEhrSession,
  getEhrSession as _getEhrSession,
} from '../database/ehr_session';

export const insertEhrSession = (opts = '') => new Promise((resolve, reject) => {
  _insertEhrSession(opts)
    .then(resolve)
    .catch(e=>{
    });
});

export const getEhrSession = (opts = {}) => _getEhrSession(opts);

export const getSessions = (opts = {}) => _getEhrSession(opts);

