export const apiConfig: Record<'development' | 'stage' | 'production' | 'demo', {
	[countryISO: string]: {
		name: string;
		iso: string;
		savePollingData: boolean;
		webeditor: {
			host: string;
			api_endpoint: string;
			api_key: string;
		};
		nodeapi: {
			host: string;
			api_endpoint: string;
			api_key: string;
		};
		local?: {
			host: string;
			hospital: string;
			// api_key: string;
			// secret: string;
			// api_key: string;
		}[];
	};
}> = {
	development: {
		[process.env.EXPO_PUBLIC_DEV_COUNTRY_ISO]: {
			name: process.env.EXPO_PUBLIC_DEV_COUNTRY_NAME,
			iso: process.env.EXPO_PUBLIC_DEV_COUNTRY_ISO,
            savePollingData: false,
            webeditor: {
                host: process.env.EXPO_PUBLIC_DEV_WEBEDITOR_HOST,
                api_endpoint: process.env.EXPO_PUBLIC_DEV_WEBEDITOR_API_ENDPOINT,
				api_key: process.env.EXPO_PUBLIC_DEV_WEBEDITOR_API_KEY,
            },
            nodeapi: {
                host: process.env.EXPO_PUBLIC_DEV_NODEAPI_HOST,
                api_endpoint: process.env.EXPO_PUBLIC_DEV_NODEAPI_API_ENDPOINT,
				api_key: process.env.EXPO_PUBLIC_DEV_NODEAPI_API_KEY,
            },
        },
	},
	stage: {
		zw:  {
			name: 'Zimbabwe',
			iso: 'zw',
            savePollingData: true,
            webeditor: {
                host:'https://zim-dev-webeditor.neotree.org',
                api_endpoint:'https://zim-dev-webeditor.neotree.org/api',
				api_key: process.env.EXPO_PUBLIC_WEBEDITOR_API_KEY,
            },
            nodeapi: {
                host:'https://zim-dev-nodeapi.neotree.org',
                api_endpoint:'https://zim-dev-nodeapi.neotree.org',
				api_key: process.env.EXPO_PUBLIC_NODEAPI_API_KEY,
            },
             local: [{
                host:'http://192.168.254.78:3000',
                hospital:'-MYim8JIk9VwHn3wMz3r',
            }]
        },
        mwi: {
			name: 'Malawi',
			iso: 'mwi',
            savePollingData: false,
            webeditor: {
                host:'https://webeditor-dev.neotree.org',
                api_endpoint:'https://webeditor-dev.neotree.org/api',
				api_key: process.env.EXPO_PUBLIC_WEBEDITOR_API_KEY,
            },
            nodeapi: {
                host:'https://nodeapi-dev.neotree.org',
                api_endpoint:'https://nodeapi-dev.neotree.org',
				api_key: process.env.EXPO_PUBLIC_NODEAPI_API_KEY,
            }
        }
	},
	production: {
		zw: {
			name: 'Zimbabwe',
			iso: 'zw',
            savePollingData: true,
            webeditor: {
                host:'https://zim-webeditor.neotree.org:10243',
                api_endpoint:'https://zim-webeditor.neotree.org:10243/api',
				api_key: process.env.EXPO_PUBLIC_WEBEDITOR_API_KEY,
            },
            nodeapi: {
                host:'http://zim-nodeapi.neotree.org',
                api_endpoint:'http://zim-nodeapi.neotree.org',
				api_key: process.env.EXPO_PUBLIC_NODEAPI_API_KEY,
            },
              local:[ {
                host:'http://192.168.254.78:3001',
                hospital:'-MZm_dIkquPzKnJl-tbM',
            }
        ]
        },
        mwi: {
			name: 'Malawi',
			iso: 'mwi',
            savePollingData: false,
            webeditor: {
                host:'https://webeditor.neotree.org',
                api_endpoint:'https://webeditor.neotree.org/api',
				api_key: process.env.EXPO_PUBLIC_WEBEDITOR_API_KEY,
            },
            nodeapi: {
                host:'https://nodeapi.neotree.org',
                api_endpoint:'https://nodeapi.neotree.org',
				api_key: process.env.EXPO_PUBLIC_NODEAPI_API_KEY,
            }
        }
	},
	demo: {
        test: {
			name: 'Test',
			iso: 'test',
            savePollingData: false,
            webeditor: {
                host:'https://demo-webeditor.neotree.org',
                api_endpoint:'https://demo-webeditor.neotree.org/api',
				api_key: process.env.EXPO_PUBLIC_WEBEDITOR_API_KEY,
            },
            nodeapi: {
                host:'https://demo-nodeapi.neotree.org',
                api_endpoint:'https://demo-nodeapi.neotree.org',
				api_key: process.env.EXPO_PUBLIC_NODEAPI_API_KEY,
            }
        }
    }
};
