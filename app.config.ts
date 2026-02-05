const NEOTREE_BUILD_TYPE = process.env.NEOTREE_BUILD_TYPE || 'development';

const appJsonRuntimeVersion = (() => {
    try {
        const appJson = require('./app.json'); // eslint-disable-line
        return appJson?.expo?.runtimeVersion;
    } catch (e) {
        return undefined;
    }
})();

const appConfig = (() => {
    let config: any = {};
    try {
        config = { ...config, ...require(`./src/config`).default } // eslint-disable-line
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
    if (appJsonRuntimeVersion !== undefined) {
        console.warn('runtimeVersion is set in app.json; remove it to avoid drift. Using src/config.ts instead.');
    }
    const runtimeVersion = appConfig?.runtimeVersion
    const _config = {
        ...config,
        ...getBuldConfig(config),
        runtimeVersion,
        updates: {
            ...config.updates,
            fallbackToCacheTimeout: 0,
            checkAutomatically: 'ON_LOAD',
        },
        extra: { 
            ...config.extra, 
            ...appConfig,
            ...getBuldConfig(config).extra,
            NEOTREE_BUILD_TYPE,
            RUNTIME_VERSION: runtimeVersion,
        },
    };
    return _config;
};
