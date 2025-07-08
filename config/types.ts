export type COUNTRY = { name: string; iso: string; };

export type COUNTRY_CONFIG = {
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
      local: [{
        host: string;
        api_key: string;
        hospital: string;
        secret: string;
    }];
}
