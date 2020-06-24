import {
  getDiagnosis as _getDiagnosis,
  getDiagnoses as _getDiagnoses
} from '../database/diagnoses';

export const getDiagnosis = (options = {}) => _getDiagnosis(options);

export const getDiagnoses = (options = {}) => _getDiagnoses(options);
