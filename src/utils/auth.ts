import { HTTP401Error } from "../controllers/error.controller";
import dataLibrary from "../lib/data";

type input = string | string[] | undefined;

export const verifyPhone  = (phone: input) => {
    
 return typeof phone == 'string' && phone.trim().length == 10 ? phone : false;
    

}

export const verifyTokenId = (token: input) => {
    return typeof (token) == 'string' && token.trim().length == 36 ? token.trim() : false;
}


export const verifyToken = async (id:input, phone:input) => {
    let token = verifyTokenId(id);
    let userPhone = verifyPhone(phone);

    if(token && phone){
       let fileName = token.slice(30);
       let tokenObject =  await dataLibrary.read('tokens',  fileName);
       if(tokenObject.phone == userPhone && tokenObject.expires > Date.now()){
        return true;
       }
    }else{
       
        throw new HTTP401Error();
    }
}