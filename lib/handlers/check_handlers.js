const _data = require("../data");
const config = require("../../config");
const helpers = require("./../helpers");
const tokenHandler = require("./token_handlers");

const checkHandlers = {
    post:(data, callback) => {
        // * Requied data : protocol, url, method, successCode, timeoutSeconds
        let protocol = typeof(data.payload.protocol) === "string" && ["https", "http"].indexOf(data.payload.protocol) > -1 ? data.payload.protocol : false;
        let url = typeof(data.payload.url) === "string" && data.payload.url.trim().length > 0 ? data.payload.url : false;
        let method = typeof(data.payload.method) === "string" && ["get", "post", "put", "delete"].indexOf(data.payload.method) > -1 ? data.payload.method : false;
        let successCode = typeof(data.payload.successCode) === "object" && data.payload.successCode instanceof Array && data.payload.successCode.length > 0 ? data.payload.successCode : false;
        let timeoutSeconds = typeof(data.payload.timeoutSeconds) === "number" && data.payload.timeoutSeconds % 1 == 0 && data.payload.timeoutSeconds >= 1 && data.payload.timeoutSeconds <= 5 ? data.payload.timeoutSeconds : false;
    
        // TODO: If all are positive then continue
        if(protocol && url && method && successCode && timeoutSeconds){
            // TODO: Get the token from header
            let token = typeof(data.headers.token) == "string" ? data.headers.token : false;
            // TODO: Lookup the user by reading the token
            _data.read("tokens", token, (err, tokenData) => {
                if(!err && tokenData){
                    let userPhone = tokenData.phone;
                   
                    // TODO: Lookup the userData
                    _data.read("users", userPhone, (err, userData) => {
                        if(!err && userData){
                            let userChecks = typeof(userData.checks) == "object" && userData.checks instanceof Array ? userData.checks : [];

                            // TODO: Verify the userChecks has not exceed the max checks limit of users
                            if(userChecks.length < config.maxChecks){
                                // TODO: Create the random id for the checks
                                let checkId = helpers.createRandomString(20);
                                // TODO : Create the check object
                                let checkObject = {
                                    'id': checkId,
                                    'userPhone': userPhone,
                                    'protocol': protocol,
                                    'url': url,
                                    'method': method,
                                    'successCode': successCode,
                                    'timeoutSeconds': timeoutSeconds
                                };

                                // TODO: Save the object
                                _data.create("checks", checkId, checkObject, function(err){
                                    if(!err){
                                        userData.checks = userChecks;
                                        userData.checks.push(checkId);;

                                        // TODO: Save the updated user data
                                        _data.update("users", userPhone, userData, function(err){
                                            if(!err){
                                                callback(200, checkObject)
                                            }else{
                                                callback(500, {"Error": "Couldn't update the user data with new check"})
                                            }
                                        })
                                    }else{
                                        callback(500, {'Error': 'Couldn"t create new check object'})
                                    }
                                })

                            }else{
                                callback(400, {"Error": `User has exceed the check limits ${config.maxChecks}`})
                            }
                        }
                    })
                }else{
                    callback(403)
                }
            })

        }else{
            callback(400, {"Error": "Missing inputs or inputs are invalid"})
        }
    
    
    },

    get: (data, callback) => {
        // TODO : get the id from parameter
         // TODO : authenticate , only signed user can available it data.
        
        let id = typeof(data.queryStringObject.id) === 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id : false;
        if(id){
            // TODO: Lookup the check as pe id
            _data.read("checks", id, function(err, checkData){
                if(!err && checkData){
                    // TODO: get the token from header
                    let token = typeof(data.headers.token) == "string" ? data.headers.token : false;
                               
                    tokenHandler.verifyToken(token, checkData.userPhone, function(tokenIsValid){
                      
                        if(tokenIsValid){
                            callback(200, checkData)
                        
                    }else{
                        callback(403, {"Error": "Missing token"})
                    }
                })
                }else{
                    callback(404, {"Error": `No check as per passed id ${id}`})
                }
            })
         

        }else{
            callback(400, {'Error' : 'Missing required fields '})
        }
    },

    put: () => {

    },

    delete: () => {

    }
}

module.exports = checkHandlers;