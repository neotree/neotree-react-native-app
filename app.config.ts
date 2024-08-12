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
            APP_ENV: 'LOCAL_DEV',
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
            APP_ENV: 'DEMO',
            eas: {
                projectId: '53b5b957-7cbe-4a1d-9bed-a4458a3baeb2',
            }, 
        },
    } : null),

    ...(NEOTREE_BUILD_TYPE === 'stage' ? {
        // version: `${config.version}-DEV`,
        name: `${config.name} (PRINT)`,
        slug: `${config.slug}-dev`,
        extra: {
            "countries": [
                {
                    "iso": "zw",
                    "name": "Zimbabwe"
                },
                {
                    "iso": "mwi",
                    "name": "Malawi"
                }
            ],
            "zw": {
                "savePollingData": true,
                "webeditor": {
                    "host":"https://zim-dev-webeditor.neotree.org:10243",
                    "api_endpoint":"https://zim-dev-webeditor.neotree.org:10243/api",
                    "api_key":"KWTXE8YYP8S3Z8SXD742PPH1ERDUQKN"
                },
                "nodeapi": {
                    "host":"http://zim-dev-nodeapi.neotree.org",
                    "api_endpoint":"http://zim-dev-nodeapi.neotree.org",
                    "api_key":"DdCbe3cz0b6fuEqDIhuML7DuOburXlFr2RCDRkFA"
                }
            },
            "mwi": {
                "savePollingData": false,
                "webeditor": {
                    "host":"https://webeditor-dev.neotree.org",
                    "api_endpoint":"https://webeditor-dev.neotree.org/api",
                    "api_key":"KWTXE8YYP8S3Z8SXD742PPH1ERDUQKN"
                },
                "nodeapi": {
                    "host":"https://nodeapi-dev.neotree.org",
                    "api_endpoint":"https://nodeapi-dev.neotree.org",
                    "api_key":"DdCbe3cz0b6fuEqDIhuML7DuOburXlFr2RCDRkFA"
                }
            },
            APP_ENV: 'DEV',
            eas: {
                projectId: '42a5fe96-9887-457c-91e7-9298cb4aa378',
            }, 
        },
    } : null),

    ...(NEOTREE_BUILD_TYPE === 'production' ? {
        // version: `${config.version}-PROD`,
        extra: {
            APP_ENV: 'PROD',
            eas: {
                projectId: '88713878-bb93-4e2d-b54f-ed71db372a81',
            }, 
        },
    } : null),
});

export default ({ config }: any) => ({
    ...config,
    ...getBuldConfig(config),
    extra: { 
        NEOTREE_BUILD_TYPE,
        ...config.extra, 
        ...appConfig,
        ...getBuldConfig(config).extra
    },
});
