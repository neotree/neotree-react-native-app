const BUILD_TYPE = process.env.BUILD_TYPE || 'development';

const appConfig = (() => {
    let config: any = {};
    try {
        config = { ...config, ...require(`./config/config.json`) } // eslint-disable-line
    } catch (e) { /**/ }
    return {
        BUILD_TYPE,
        ...config[BUILD_TYPE],
    };
})();

export default ({ config }: any) => ({
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
