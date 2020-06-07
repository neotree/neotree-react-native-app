import {
  saveForm as _saveForm,
  getForm as _getForm,
  getForms as _getForms,
} from '../database/forms';

export const saveForm = (opts = {}) => _saveForm(opts);

export const getForm = (opts = {}) => _getForm(opts);

export const getForms = (opts = {}) => _getForms(opts);
