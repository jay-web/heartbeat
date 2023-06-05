import crypto = require('crypto');
import serverEnvironment from "../config";
import { AppError } from '../controllers/error.controller';

export const hashUserPassword = (string) => {
    let hash = crypto.createHmac('sha256', serverEnvironment.secret).update(string).digest('hex');

    return hash;
}

export const verifyPassword = (password:string, passwordInDB) => {
    let hashPassword = hashUserPassword(password);
    if(hashPassword === passwordInDB){
        return true;
    }else{
        throw new AppError(403, "Incorrect Password");
    }

}