import { dbTransaction } from '../data/db';
import { getLocation } from '../data/queries';

export async function handleAppCrush(error: any) {
    const stack = error.stack.split('in').splice(0,5).join(" in");
    const message = error.message;
    console.log("====STACK===",stack)
    console.log("====MSG===",message)
    let app = await dbTransaction('select * from application where id=1;');
    console.log("====MSG2===",app)
      let  application = app[0];
        if(application){
           
            let e = await dbTransaction(`select * from exceptions where message='${message}'`);
            
            if(e && e.length>0){
                console.log("====MSGE3===",e)
                // DO NOTHING ERROR ALREADY CAPTURED
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