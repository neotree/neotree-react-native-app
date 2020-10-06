import makeApiCall from './makeApiCall';
import makeEHRApiCall from './makeEHRApiCall';
import { getEhrSession} from '@/api/ehr_session'

export const exportSession = (body = {}, reqOpts = {}) => {
  const { script, uid, } = body;
  return makeApiCall(`/sessions?uid=${uid}&scriptId=${script.id}`, {
    body,
    method: 'POST',
    ...reqOpts,
  });
};
export const exportPersonRegToEHR = (body = {}, reqOpts = {}) => {
  
  return makeEHRApiCall(`/people`, {
    body,
    method: 'POST',
    ...reqOpts,
  });
};

export const exportDemographicsToEHR = (body = {}, reqOpts = {}) => {
 const {personId} = body;
  return makeEHRApiCall(`/people/${personId}`, {
    body,
    method: 'PUT',
    ...reqOpts,
  });
};
export const exportPatientAdmissionToEHR = (body = {}, reqOpts = {}) => {
   return makeEHRApiCall(`/patients/in-patient-admission`, {
     body,
     method: 'POST',
     ...reqOpts,
   });
 };
 


export const authenticateEhrApi = async(body = {}, reqOpts = {}) => {

 const localToken = await getEhrSession({});
  if(localToken && localToken.ehr_session && localToken.ehr_session.session_key ){
   try{ 
  const jwt = JSON.parse(atob(localToken.ehr_session.session_key.split('.')[1]));

  if(jwt && jwt.exp){
   const expiry =  jwt.exp * 1000;
   if (!isValidJWT(expiry)){
   return localToken
   }
  }
  }catch(e){
    try{
   return makeEHRApiCall(`/authenticate`, {
     body,
     method: 'POST',
     ...reqOpts,
   });
  }catch(e){

   }
    }
  }
  else{
  try{
          return makeEHRApiCall(`/authenticate`, {
      body,
      method: 'POST',
      ...reqOpts,
    });
   }catch(e){
  
  }
  }  

};

export const isValidJWT = (expiry)=>{
  if (!expiry) {
    return false;
}
return Date.now() > expiry;

}