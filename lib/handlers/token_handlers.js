const helpers = require("../helpers.js");
const _data = require("../data");

const tokenHandler = {
    post: (data, callback) => {
        // TODO : Check phone and password is included in payload for this request
        let phone = typeof(data.payload.phone) === "string" && data.payload.phone.trim().length >= 10 ? data.payload.phone : false;
        let password = typeof(data.payload.password ) === "string" && data.payload.password.trim().length >= 8 ? data.payload.password : false;
       
        // TODO: if phone and password available
        if(phone && password){
            // TODO: check user is present in database with phone
            _data.read("users", phone, (err, userData) => {
                if(!err && userData){
                    // TODO: Now matched the password with the saved password in database
                    let hashedPassword = helpers.hash(password);
                   
                    if(hashedPassword === userData.hashedPassword){
                        // TODO: Create the new token with random name, with one hour expiration time
                        let tokenId = helpers.createRandomString(20);
                        let expiry = Date.now() * 1000 * 60 * 60;
                        let tokenObject = {
                            'phone': phone,
                            'id': tokenId,
                            'expires': expiry
                        }

                        // TODO: create the token and particular file
                        _data.create("tokens", tokenId, tokenObject, (err) => {
                            if(!err){
                                callback(200, tokenObject)
                            }else{
                                callback(500, {"Error": "Couldn't create token file at this time"})
                            }
                        })
                    }else{
                        callback(404, {"Error": "Wrong password"})
                    }
                }else{
                    callback(400, {"Error": "Couldn't find the specified user"})
                }
            })

        }else{
            callback(404, {"Error": "Didn't get required fields (phone and password)"})
        }
    },
    get: (data, callback) => {
        // TODO: fetch token id from queryStringObject 
        let id = typeof(data.queryStringObject.id) === "string" && data.queryStringObject.id.trim().length >=10 ? data.queryStringObject.id : false;
        if(id){
            _data.read("tokens", id, (err, tokenData) => {
                if(!err){
                    callback(200, tokenData);
                }else{
                    callback(404)
                }
            })
        }else{
            callback(400, {"Error": "Missing required id field !!"})
        }
    }
}

module.exports = tokenHandler;