import ehrConfig from '~/config/ehr-api.json';
import { authenticateEhrApi } from '@/api/export';
export default  function getJWTToken() {
  const {username,password,rememberMe} = ehrConfig;
  const body = {username:username,password:password,rememberMe:rememberMe}
   return authenticateEhrApi(body)
    .then((result) => {
       if(result && !result.ehr_session){
        const token = JSON.parse(result)
        if(token && token.id_token){
        insertEhrSession(token.id_token)
        .then(()=>{
          return token.id_token
        })
        }
      } 
     console.log("&&&&777777---",result.ehr_session.session_key)
      return result.ehr_session.session_key;
}).catch((e)=>{
  console.log('UUUUUUUU---',e)
})
}
