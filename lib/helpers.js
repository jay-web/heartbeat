const crypto = require('crypto');
const config = require("../config");
const queryString = require('querystring');
const https = require('https');


const helpers = {
    hash: (str) => {
        if(typeof(str) === 'string' && str.length >=8){
            let hash = crypto.createHash('sha256', config.secret).update(str).digest('hex');
            return hash;
        }else{
            return false;
        }
    },

    parsedJsonToObject: (str) => {
        try{
            let obj = JSON.parse(str);
            return obj;
        }catch(e){
            return {};
        }
    },

    createRandomString: (strLength) => {
        strLength = typeof(strLength) === "number" && strLength > 0 ? strLength : false;
        if(strLength){
            let possibleCharacters = "abcdefghijlmnopqrsuvwxyz0123456789";
            let str = '';
            for(let i =0; i<strLength; i++){
                let randomCharacters = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length))
                str += randomCharacters;
              
            }
            return str;
        }else{
            return false;
        }
    },

    sendSmsToUser : (phone, msg, callback) => {

        // TODO: Validate parameter
        phone = typeof(phone) === 'string' && phone.trim().length == 10 ? phone.trim() : false;
        msg = typeof(msg) === 'string' && msg.trim().length > 0 && msg.trim().length < 1600 ? msg : false;
       
        if(phone && msg){
            let payload = {
                'From': config.twilio.fromPhone,
                'To': '+91' + phone,
                'Body': msg
            }
            

            // TODO: Stringify the payload
            let stringifyPayload = queryString.stringify(payload);

          

            // TODO: Configure the request details
            let requestDetails = {
                'protocol': 'https:',
                'hostname': 'api.twilio.com',
                'method' : 'POST',
                'path' : '/2010-04-01/Accounts/'+config.twilio.accountSid+'/Messages.json',
                'auth': config.twilio.accountSid+':'+config.twilio.authToken,
                'headers':{
                    'Content-Type' : 'application/x-www-form-urlencoded',
                    'Content-Length' : Buffer.byteLength(stringifyPayload)
                }
            };

         
            // TODO: Initiate the request
            let req = https.request(requestDetails, function(res){

                let status = res.statusCode;

                if(status == 200 || status == 201){
                    callback(false);
                }else{
                    callback('Status code returned was ' + status);
                }
            });

            // TODO: Bind the event error

            req.on('error', function(e){
                callback(e);
            })

            // TODO: Add the payload
            req.write(stringifyPayload);

            // TODO: End the request
            req.end();


        }else{
            callback(400, {"Error": "Phone or msg are invalid, please check parameters"})
        }
    }
    }

module.exports = helpers;