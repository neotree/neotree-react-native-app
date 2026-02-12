const NEOTREE_BUILD_TYPE = process.env.NEOTREE_BUILD_TYPE || 'development';

const appConfig = (() => {
    let config: any = {};
    try {
        config = { ...config, ...require(`./config/config.json`) };
    } catch (e) { /**/ }
    return { ...config[NEOTREE_BUILD_TYPE] };
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
    const buildConfig = getBuldConfig(config);

    const _config = {
        ...config,
        ...buildConfig,

        android: {
            ...config.android,
            permissions: [
                // Android 11 and below
                'BLUETOOTH',
                'BLUETOOTH_ADMIN',
                'ACCESS_FINE_LOCATION',
                // Android 12+
                'BLUETOOTH_SCAN',
                'BLUETOOTH_CONNECT',
            ],
        },

        extra: {
            ...config.extra,
            ...appConfig,
            ...buildConfig?.extra,
            NEOTREE_BUILD_TYPE,
        },
    };

    return _config;
};
