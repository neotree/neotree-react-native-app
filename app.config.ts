const NEOTREE_BUILD_TYPE = process.env.NEOTREE_BUILD_TYPE || 'development';

const EAS_PROJECT_IDS: Record<string, string> = {
    demo: '53b5b957-7cbe-4a1d-9bed-a4458a3baeb2',
    stage: '42a5fe96-9887-457c-91e7-9298cb4aa378',
    production: '88713878-bb93-4e2d-b54f-ed71db372a81',
};

const isLocalDevelopment = NEOTREE_BUILD_TYPE === 'development';
const getProjectId = () => EAS_PROJECT_IDS[NEOTREE_BUILD_TYPE] || EAS_PROJECT_IDS.stage;

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
                projectId: EAS_PROJECT_IDS.stage,
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
                projectId: getProjectId(),
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
                projectId: getProjectId(),
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
                projectId: getProjectId(),
            }, 
        },
    } : null),
});

export default ({ config }: any) => {
    const runtimeVersion =
        appJsonRuntimeVersion !== undefined ? appJsonRuntimeVersion : config?.runtimeVersion;
    const _config = {
        ...config,
        ...getBuldConfig(config),
        runtimeVersion,
        updates: isLocalDevelopment ? {
            ...config.updates,
            enabled: false,
            fallbackToCacheTimeout: 0,
            checkAutomatically: 'NEVER',
        } : {
            ...config.updates,
            fallbackToCacheTimeout: 0,
            checkAutomatically: 'ON_LOAD',
            url: `https://u.expo.dev/${getProjectId()}`,
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
