const userHandler = require("./users_handlers");
const tokenHandler = require("./token_handlers");
const checkHandlers = require("./check_handlers");

const acceptableMethods = ["post", "get", "put", "delete"];

module.exports = {
    user: function(data, callback) {
        
        if(acceptableMethods.indexOf(data.method) > -1){
            userHandler[data.method](data, callback)
        }else{
            callback(405);
        }
    },
    token: function(data, callback){
        if(acceptableMethods.indexOf(data.method) > -1){
            tokenHandler[data.method](data, callback)
        }else{
            callback(405)
        }
    },
    check: function(data, callback){
        if(acceptableMethods.indexOf(data.method) > -1){
            checkHandlers[data.method](data, callback)
        }else{
            callback(405);
        }
    },
    ping : function(data, callback){
        // callback a http status code and payload object
        callback(200);
    },

    notFound : function(data, callback){
        callback(404)
    }
}