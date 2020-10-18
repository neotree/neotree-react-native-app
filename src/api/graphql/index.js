import apiConfig from '~/config/ehr-api.json';
import {ApolloClient, InMemoryCache} from '@apollo/client'

export const client = new ApolloClient({ 
  uri: `${apiConfig.graphql_endpoint}`,
  cache: new InMemoryCache()
 
}) 
