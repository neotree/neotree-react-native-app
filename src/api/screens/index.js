import {
  getScreen as _getScreen,
  getScreens as _getScreens
} from '../database/screens';

export const getScreen = (options = {}) => _getScreen(options);

export const getScreens = (options = {}) => _getScreens(options);
