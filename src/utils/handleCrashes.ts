import { dbTransaction } from '../data/db';
import { getLocation } from '../data/queries';

export async function handleAppCrush(error: any) {
    const stack = error.stack.split('in').splice(0,6).join(" in");
    const message = error.message;
    let app = await dbTransaction('select * from application where id=1;');
      let  application = app[0];
        if(application){
           
            let e = await dbTransaction(`select * from exceptions where message='${message}'`);
            
            if(e && e.length>0){
               // ERROR ALREADY LOGGED, DO NOTHING
            }else{
                
                //RECORD THE ERROR
                try{
                const columns = ['message', 'stack', 'device', 'exported','country','hospital'].join(',');
                const values = ['?', '?', '?', '?', '?','?'].join(',');
                const location = await getLocation();
                console.log("====MSGE4===",location)
                await dbTransaction(`insert into exceptions (${columns}) values (${values});`, [
                    message,
                    stack,
                    application.device_id,
                    false,
                    location?.country,
                    location?.hospital
                
                ]).then(res=>{
                    console.log("===ZVAITA====",res)
                });
            }catch(ex){
            console.log("---DB EX---",ex)
            }
        }
        }

}