import { SocketEvent } from '@/api';

export * from './navigation';
export * from '@/api/types';

export interface AuthenticatedUser {
    
}

export interface InitApiResults {
    authenticatedUser: AuthenticatedUser | null;
}

export interface AppContext {
    lastSocketEvent?: SocketEvent;
    authenticatedUser: AuthenticatedUser | null;
    colorScheme: 'light' | 'dark';
    refreshApp: () => void;
}

type CountryConfig = {
  country_name: string;
  country_code: string;
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
    countries: CountryConfig[];
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
  }
  