import { AppError } from "../controllers/error.controller";
import { ICheck } from "../interfaces/checkData";
import { IUser } from "../interfaces/user";


export const validateUserInput  = (data: IUser) => {
    
    let firstName = typeof (data.firstName) == 'string' && data.firstName.trim().length > 0 ? data.firstName.trim() : false;
    let lastName = typeof (data.lastName) == 'string' && data.lastName.trim().length > 0 ? data.lastName.trim() : false;
    let phone = typeof (data.phone) == 'string' && data.phone.trim().length == 10 ? data.phone.trim() : false;
    let password = typeof (data.password) == 'string' && data.password.trim().length > 6 ? data.password.trim() : false;
    let tosArgreement = typeof (data.tosArgreement) == 'boolean' && data.tosArgreement == true ? true : false;
    
    if(firstName && lastName && phone && password && tosArgreement){
        return true;
    }else{
        return false;
    }

}

export const validateCheckInput = (data: ICheck) => {
    let {protocol, url, method, successCode, timeoutSeconds} = data;
    console.log(`payload `, protocol, url, method, successCode, timeoutSeconds)
    let checkProtocol = typeof (protocol) == 'string' && ['https', 'http'].indexOf(protocol) > -1 ? protocol : false;
    let checkUrl = typeof (url) == 'string' && url.trim().length > 0 ? url.trim() : false;
    let checkMethod = typeof (method) == 'string' && ['get', 'post', 'put', 'delete'].indexOf(method) > -1 ? method : false;
    let checkSuccessCode = typeof (successCode) == 'object' && successCode instanceof Array ? successCode : false;
    let checkTimeoutSeconds = typeof (timeoutSeconds) == 'number' && timeoutSeconds % 1 == 0 && timeoutSeconds >= 1  && timeoutSeconds <= 5? timeoutSeconds : false;

   
    if(checkProtocol && checkUrl && checkMethod && checkSuccessCode && checkTimeoutSeconds ){
        return true;
    }else{
        throw new AppError(400, "Missing required field")
    }
}

export const validateCheckInputForUpdate = (data: ICheck) => {
    let {protocol, url, method, successCode, timeoutSeconds} = data;
    console.log(`payload `, protocol, url, method, successCode, timeoutSeconds)
    let checkProtocol = typeof (protocol) == 'string' && ['https', 'http'].indexOf(protocol) > -1 ? protocol : false;
    let checkUrl = typeof (url) == 'string' && url.trim().length > 0 ? url.trim() : false;
    let checkMethod = typeof (method) == 'string' && ['get', 'post', 'put', 'delete'].indexOf(method) > -1 ? method : false;
    let checkSuccessCode = typeof (successCode) == 'object' && successCode instanceof Array ? successCode : false;
    let checkTimeoutSeconds = typeof (timeoutSeconds) == 'number' && timeoutSeconds % 1 == 0 && timeoutSeconds >= 1  && timeoutSeconds <= 5? timeoutSeconds : false;

   
    if(checkProtocol || checkUrl || checkMethod || checkSuccessCode || checkTimeoutSeconds ){
        return true;
    }else{
        throw new AppError(400, "Missing required field")
    }
}

