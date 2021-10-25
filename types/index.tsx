export * from './navigation';

export interface AuthenticatedUser {
    
}

export interface InitApiResults {
    authenticatedUser: AuthenticatedUser | null;
}

export interface AppContext {
    authenticatedUser: AuthenticatedUser | null;
    colorScheme: 'light' | 'dark';
    refreshApp: () => void;
}

type Countries = 'malawi' | 'zimbabwe';
type CountryConfig = {
    nodeapi: {
        api_endpoint: string;
        api_key: string;
        host: string;
    };
    webeditor: {
      api_endpoint: string;
      api_key: string;
      host: string;
    };
};

export type ENV = {
    BUILD_TYPE: 'development' | 'stage' | 'production';
    countries: Countries[];
    firebaseConfig: {
      apiKey: string;
      appId: string;
      authDomain: string;
      databaseURL: string;
      measurementId: string;
      messagingSenderId: string;
      projectId: string;
      storageBucket: string;
    },
    malawi: CountryConfig;
    zimbabwe: CountryConfig;
  }
  