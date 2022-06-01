import Constants from 'expo-constants';
import { getLocation } from '@/api/_location';

const _config = Constants.manifest.extra;

export const getConfig = async () => {
    let config = {};
    try {
      const location = await getLocation();
      if (location) config = _config[location.country];
    } catch (e) { throw e; }
    return config;
  };

export default _config;
