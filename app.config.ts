import configJSON from './config/config.json';

const NEOTREE_BUILD_TYPE = process.env.NEOTREE_BUILD_TYPE || 'development'

const appConfig = configJSON[NEOTREE_BUILD_TYPE];

const getBuildConfig = (config: any) => ({
    ...(NEOTREE_BUILD_TYPE === 'development' ? {
        extra: {
            eas: {
                projectId: '88713878-bb93-4e2d-b54f-ed71db372a81',
            }, 
        },
    } : null),

    ...(NEOTREE_BUILD_TYPE === 'demo' ? {
        // version: `${config.version}-DEMO`,
        name: `${config.name} (DEMO)`,
        slug: `${config.slug}-demo`,
        extra: {
            eas: {
                projectId: '53b5b957-7cbe-4a1d-9bed-a4458a3baeb2',
            }, 
        },
    } : null),

    ...(NEOTREE_BUILD_TYPE === 'stage' ? {
        // version: `${config.version}-DEV`,
        name: `${config.name} (DEV)`,
        slug: `${config.slug}-dev`,
        extra: {
            eas: {
                projectId: '42a5fe96-9887-457c-91e7-9298cb4aa378',
            }, 
        },
    } : null),

    ...(NEOTREE_BUILD_TYPE === 'production' ? {
        // version: `${config.version}-PROD`,
        extra: {
            eas: {
                projectId: '88713878-bb93-4e2d-b54f-ed71db372a81',
            }, 
        },
    } : null),
});

export default ({ config }: any) => ({
    ...config,
    ...getBuildConfig(config),
    extra: { 
        NEOTREE_BUILD_TYPE,
        ...config.extra, 
        ...appConfig,
        ...getBuildConfig(config).extra
    },
});
