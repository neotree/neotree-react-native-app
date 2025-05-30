const NEOTREE_BUILD_TYPE = process.env.NEOTREE_BUILD_TYPE || 'development';

const appConfig = (() => {
    let config: any = {};
    try {
        config = { ...config, ...require(`./config/config.json`) } // eslint-disable-line
    } catch (e) { /**/ }
    return { ...config[NEOTREE_BUILD_TYPE], };
})();

const getBuldConfig = (config: any) => ({
    ...(NEOTREE_BUILD_TYPE === 'development' ? {
        extra: {
            ...config.extra,
            APP_ENV: 'LOCAL_DEV',
            eas: {
                ...config?.extra?.eas,
                projectId: '88713878-bb93-4e2d-b54f-ed71db372a81',
            }, 
        },
    } : null),

    ...(NEOTREE_BUILD_TYPE === 'demo' ? {
        // version: `${config.version}-DEMO`,
        name: `${config.name} (DEMO)`,
        slug: `${config.slug}-demo`,
        extra: {
            ...config.extra,
            APP_ENV: 'DEMO',
            eas: {
                ...config?.extra?.eas,
                projectId: '53b5b957-7cbe-4a1d-9bed-a4458a3baeb2',
            }, 
        },
    } : null),

    ...(NEOTREE_BUILD_TYPE === 'stage' ? {
        // version: `${config.version}-DEV`,
        name: `${config.name} (DEV)`,
        slug: `${config.slug}-dev`,
        extra: {
            ...config.extra,
            APP_ENV: 'DEV',
            eas: {
                ...config?.extra?.eas,
                projectId: '42a5fe96-9887-457c-91e7-9298cb4aa378',
            }, 
        },
    } : null),

    ...(NEOTREE_BUILD_TYPE === 'production' ? {
        // version: `${config.version}-PROD`,
        extra: {
            ...config.extra,
            APP_ENV: 'PROD',
            eas: {
                ...config?.extra?.eas,
                projectId: '88713878-bb93-4e2d-b54f-ed71db372a81',
            }, 
        },
    } : null),
});

export default ({ config }: any) => {
    const _config = {
        ...config,
        ...getBuldConfig(config),
        extra: { 
            ...config.extra, 
            ...appConfig,
            ...getBuldConfig(config).extra,
            NEOTREE_BUILD_TYPE
        },
    };
    return _config;
};
