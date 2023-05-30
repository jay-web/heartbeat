import dataLibrary from "../lib/data";

type input = string | string[] | undefined;

export const verifyPhone  = (phone: input) => {
    
 return typeof phone == 'string' && phone.trim().length == 10 ? phone : false;
    

}

export const verifyId = (token: input) => {
    return typeof (token) == 'string' && token.trim().length == 20 ? token.trim() : false;
}


export const verifyToken = async (id:input, phone:input) => {
    let token = verifyId(id);
    let userPhone = verifyPhone(phone);

    if(token && phone){
       let tokenObject =  await dataLibrary.read('tokens',  token)
       if(tokenObject.phone == userPhone && tokenObject.expires > Date.now()){
        return true;
       }
    }else{
        return false;
    }
}