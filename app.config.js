const BUILD_TYPE = process.env.BUILD_TYPE;

const appConfig = (() => {
  const config = { BUILD_TYPE };
  try {
    if (BUILD_TYPE) {
      config.firebaseConfig = require(`./config/firebase.${BUILD_TYPE}.json`); // eslint-disable-line
      config.nodeapiConfig = require(`./config/nodeapi.${BUILD_TYPE}.json`); // eslint-disable-line
      config.webeditorConfig = require(`./config/webeditor.${BUILD_TYPE}.json`); // eslint-disable-line 
    } else {
      config.firebaseConfig = require('./config/firebase.json');
      config.nodeapiConfig = require('./config/nodeapi.json');
      config.webeditorConfig = require('./config/webeditor.json');
    }
  } catch (e) {
    return { LOAD_CONFIG_FILE_ERROR: e.message };
  }
  return config;
})();

export default ({ config }) => ({
  ...config,

  ...(BUILD_TYPE === 'development' ? {
    version: `${config.version}-DEV`,
    name: `${config.name} (DEV)`,
    slug: `${config.slug}-dev`,
  } : null),

  ...(BUILD_TYPE === 'production' ? {
    version: `${config.version}-PROD`,
  } : null),

  extra: { ...config.extra, ...appConfig },
});
