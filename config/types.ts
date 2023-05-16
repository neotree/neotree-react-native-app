export type COUNTRY = { name: string; iso: string; };

export type COUNTRY_CONFIG = {
    savePollingData: boolean;
    mysql_user: string,
    mysql_pw: string,
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
}
