namespace NodeJS {
    interface ProcessEnv {
        NODE_ENV: string;
        NEOTREE_BUILD_TYPE: 'development' | 'stage' | 'production' | 'demo';
    }
}
