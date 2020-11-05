const BUILD_TYPE = process.env.BUILD_TYPE || 'development';

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

  extra: { ...config.extra, BUILD_TYPE },
});
