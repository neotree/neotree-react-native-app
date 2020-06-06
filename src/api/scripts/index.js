import {
  getScript as _getScript,
  getScripts as _getScripts
} from '../database/scripts';

export const getScript = (options = {}) => _getScript(options);

export const getScripts = (options = {}) => _getScripts(options);
