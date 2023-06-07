// export const createRandomString = (strLength: number) => {
//     if(strLength > 0){
//         let characters = `abcdefghijklmnopqrstuvwxyz0123456789`;
//         let id = '';
//         for (let index = 1; index <= strLength; index++) {
//             id+= characters.charAt(Math.floor(Math.random() * characters.length))
//         }
//         return id;
//     }else{
//         return false;
//     }
// }

import { ICheck } from "../interfaces/checkData";
import config from "../config.js";
import https from "node:https";
const querystring = require('node:querystring'); 

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


export const sendTwilioSms = async (phone:string , msg:string, callback) => {
    
    let userPhone:string | boolean = phone.trim().length == 10 ? phone.trim() : false;
    let userMessage:string | boolean = msg.trim().length > 0 &&  msg.trim().length <=1000 ?  msg.trim() : false;

    if(userPhone && userMessage){
        let payload = {
            'From': config.twilio.fromPhone,
            'To': '+91'+phone,
            'Body':msg
        };

        // ! stringify the payload 
        let stringPayload = querystring.stringify(payload);

        // ! Configure the request details

        let requestDetails = {
            'protocol': 'https:',
            'hostname': 'api.twilio.com',
            'method': 'POST',
            'path': '/2010-04-01/Accounts/'+config.twilio.accountSid+'/Messages.json',
            'auth': config.twilio.accountSid+':'+config.twilio.authToken,
            'headers':{
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(stringPayload)
            }
        };

        // ! Instantiate the HTTP request
       let req =  https.request(requestDetails, (res) => {
        // console.log('res from twilio ', res)
            if(res.statusCode == 200 || res.statusCode == 201){
                callback(false)
            }else{
                callback('twilio return status code ' + res.statusCode)
            }
        });

        // !Bind to the error event 
        req.on('error', function(error){
            callback(error)
        });

        // !Add the payload
        req.write(stringPayload);

        // ! End the request
        req.end()

    }else{
        callback(400, { 'Error ': 'Invalid phone or msg'})
    }
}