import {
  saveSession as _saveSession,
  getSession as _getSession,
  getSessions as _getSessions,
  deleteSessions as _deleteSessions,
} from '../database/sessions';

export const saveSession = (opts = {}) => _saveSession(opts);

export const getSession = (opts = {}) => _getSession(opts);

export const getSessions = (opts = {}) => _getSessions(opts);

export const deleteSessions = (opts = {}) => _deleteSessions(opts);
