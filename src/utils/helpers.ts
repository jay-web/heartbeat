// export const createRandomString = (strLength: number) => {
//     if(strLength > 0){
//         let characters = `abcdefghijklmnopqrstuvwxyz0123456789`;
//         let id = '';
//         for (let index = 1; index <= strLength; index++) {
//             id+= characters.charAt(Math.floor(Math.random() * characters.length))
//         }

import { ICheck } from "../interfaces/checkData"

//         return id;
//     }else{
//         return false;
//     }
// }

export const updateCheckData = (checkData:ICheck, payload:ICheck) => {
    let {protocol, url, method, successCode, timeoutSeconds} = payload;

    if(protocol){
        checkData.protocol = protocol;
    }
    if(url){
        checkData.url = url;
    }
    if(method){
        checkData.method = method;
    }
    if(successCode){
        checkData.successCode = successCode;
    }
    if(timeoutSeconds){
        checkData.timeoutSeconds = timeoutSeconds;
    }

    return checkData;
}