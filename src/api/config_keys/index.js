import {
  getConfigKey as _getConfigKey,
  getConfigKeys as _getConfigKeys
} from '../database/config_keys';

export const getConfigKey = (options = {}) => _getConfigKey(options);

export const getConfigKeys = (options = {}) => _getConfigKeys(options);
