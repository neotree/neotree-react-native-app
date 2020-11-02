const BUILD_TYPE = process.env.BUILD_TYPE || 'development';

export default ({ config }) => ({
  ...config,
  ...(BUILD_TYPE === 'development' ? {
    version: `${config.version}-DEV`,
    name: `${config.name} (DEV)`,
    slug: `${config.slug}-dev`,
  } : null),
  extra: { BUILD_TYPE },
});
