import ehrConfig from '~/config/ehr-api.json';
import { authenticateEhrApi } from '@/api/export';
import {insertEhrSession} from '@/api/ehr_session';
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
      if(result.ehr_session){
       return result.ehr_session.session_key;
      } else{
        const token = JSON.parse(result)
        return token.id_token;
      }
}).catch((e)=>{
  console.log('UUUUUUUU---',e)
})
}
