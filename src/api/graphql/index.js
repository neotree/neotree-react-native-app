import ApolloClient from "apollo-boost";

export const client = (uri='') =>{
    return  new ApolloClient({ uri: uri})
}