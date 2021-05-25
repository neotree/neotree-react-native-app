const BUILD_TYPE = process.env.BUILD_TYPE || 'development';

const appConfig = (() => {
  let config = { BUILD_TYPE };
  try {
    config.firebaseConfig = require(`./config/firebase.${BUILD_TYPE}.json`); // eslint-disable-line
    config = { ...config, ...require(`./config/config.${BUILD_TYPE}.json`) } // eslint-disable-line
  } catch (e) {
    return { LOAD_CONFIG_FILE_ERROR: e.message };
  }
  return config;
})();

export default ({ config }) => ({
  ...config,

  ...(BUILD_TYPE === 'demo' ? {
    version: `${config.version}-DEMO`,
    name: `${config.name} (DEMO)`,
    slug: `${config.slug}-demo`,
  } : null),

  ...(BUILD_TYPE === 'stage' ? {
    version: `${config.version}-DEV`,
    name: `${config.name} (DEV)`,
    slug: `${config.slug}-dev`,
  } : null),

  ...(BUILD_TYPE === 'production' ? {
    version: `${config.version}-PROD`,
  } : null),

  extra: { ...config.extra, ...appConfig },
});
