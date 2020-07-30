import {
  saveSession as _saveSession,
  getSession as _getSession,
  getSessions as _getSessions,
  countSessions as _countSessions,
  deleteSessions as _deleteSessions,
  updateSessions as _updateSessions,
} from '../database/sessions';

export const saveSession = (opts = {}) => new Promise((resolve, reject) => {
  _saveSession(opts)
    .then(({ insertId: id }) => _getSession({ id })
      .then(resolve)
      .then(reject)
    )
    .catch(reject);
});

export const getSession = (opts = {}) => _getSession(opts);

export const getSessions = (opts = {}) => _getSessions(opts);

export const deleteSessions = (opts = {}) => _deleteSessions(opts);

export const countSessions = (opts = {}) => _countSessions(opts);

export const updateSessions = (opts = {}) => _updateSessions(opts);
