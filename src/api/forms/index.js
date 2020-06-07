import {
  saveForm as _saveForm,
  getForm as _getForm,
  getForms as _getForms,
  deleteForms as _deleteForms,
} from '../database/forms';

export const saveForm = (opts = {}) => _saveForm(opts);

export const getForm = (opts = {}) => _getForm(opts);

export const getForms = (opts = {}) => _getForms(opts);

export const deleteForms = (opts = {}) => _deleteForms(opts);
