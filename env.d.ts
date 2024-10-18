namespace NodeJS {
    interface ProcessEnv {
        NODE_ENV: string;
        NEOTREE_BUILD_TYPE: 'development' | 'stage' | 'production' | 'demo';
        EXPO_PUBLIC_API_URL: string;
        EXPO_PUBLIC_API_KEY: string;
    }
}
