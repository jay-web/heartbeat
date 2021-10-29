const crypto = require('crypto');
const config = require("../config");


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
    }
}

module.exports = helpers;