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
    }
}

module.exports = helpers;