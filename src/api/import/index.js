import apiConfig from '~/config/ehr-api.json';
import client from './../graphql'

export const importPerson = (reqOpts = {},personId='') =>  new Promise((resolve, reject) => {
    uri = `${apiConfig.graphql_endpoint}`;
   
    return client.query({
      query: gql`
     query person(id:${personId}) {
        ${reqOpts}
      }
      `
    }).then(response => {
      console.log(response.data.person)
      resolve(response)
    }).catch(e => {
        require('@/utils/logger')(`ehrGraphQLQuery ERROR: ${uri}: `, e);
        reject(e);
      });
  });
  

