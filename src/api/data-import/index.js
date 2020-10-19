import { gql } from "@apollo/client";
import { client } from "@/api/graphql";

export const importPerson = (personId = "") =>
  new Promise(async (resolve, reject) => {
    client
      .query({
        query: gql`
          query ($id: String) {
            person(id: $id){
                 personId
                 lastname
                 firstname
                 fullname
                 sex
                 birthdate
                 infant
                 selfIdentifiedGender
                 education{
                   id,
                   name
                 }
                 occupation{
                   id,
                   name
                 }
                 marital{
                   id,
                   name
                 }
                 religion{
                   id,
                   name
                 }
                 nationality{
                   id,
                   name
                 }
                 denomination{
                   id,
                   name
                 }
                 countryOfBirth{
                   id,
                   name
                 }
               }
              }      
        `,
        "variables": {
          "id": personId
      } ,
       fetchPolicy:'network-only' 
      })
      .then((result) =>{

       resolve(result)
      }).catch(e=>{
        console.log("MaIwEEEEEEE0-----",e)
        reject(e)
      });
  });
