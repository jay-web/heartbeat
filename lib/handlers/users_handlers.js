const _data = require("./../data");

const helpers = require("./../helpers");

const userHandler = {
    post: (data, callbacks) => {
        // * Checkout all the required fields are filled out
        let firstName = typeof(data.payload.firstName) === "string" && data.payload.firstName.trim().length > 1 ? data.payload.firstName : false;
        let lastName = typeof(data.payload.lastName) === "string" && data.payload.lastName.trim().length > 1 ? data.payload.lastName : false;
        let phone = typeof(data.payload.phone) === "string" && data.payload.phone.trim().length === 10 ? data.payload.phone : false;
        let password = typeof(data.payload.password) === "string" && data.payload.password.trim().length >= 8 ? data.payload.password : false;
        let tosAgreement = typeof(data.payload.tosAgreement) === "boolean"  ? data.payload.tosAgreement : false;

        if(firstName && lastName && phone && password && tosAgreement){
                _data.read("users", phone, function(err, data) {
                    // * if err, means no user exist with mentioned phone,so we can create new one
                    if(err){
                        let hashedPassword = helpers.hash(password);
                        if(hashedPassword){
                            let userObject = {
                                'firstName': firstName,
                                'lastName' : lastName,
                                'phone': phone,
                                'hashedPassword': hashedPassword,
                                'tosAgreement': tosAgreement
                            }

                            _data.create('users', phone, userObject, function(err){
                                if(!err){
                                    callbacks(200, { "message": "New user created successfully"});
                                }else{
                                    callbacks(500, {"Error": "Error in creating users"})
                                }
                                
                            })
                        }
                    }else{
                        callbacks(400, {"Error": "A user with mentioned phone number already exists !!"})
                    }
                })
        }else{
            callbacks(400, {'Error': 'Missing required fields !!!'})
        }


    },
    
    get: (data, callbacks) => {
    // TODO : get the phone as parameter
    // TODO : authenticate , only signed user can available it data.
        // extract phone number from query 
        let phone = typeof(data.queryStringObject.phone) === 'string' && data.queryStringObject.phone.trim().length >= 10 ? data.queryStringObject.phone : false;
        if(phone){
            _data.read('users', phone, function(err, data){
                
                if(!err && data){
                    delete data.password;
                   
                    callbacks(200, data)
                }else{
                    callbacks(404)
                }
            })
        }else{
            callbacks(400, {'Error' : 'Missing required fields '})
        }

    },
    put: (data, callbacks) => {
        // TODO : Get the phone number required to search the user
        // TODO : Get the other required at least one to update
        // TODO : Only allowed if authenticated
        let phone = typeof(data.payload.phone) === 'string' && data.payload.phone.trim().length >= 10 ? data.payload.phone : false;
        if(phone){
            let firstName = typeof(data.payload.firstName) === "string" && data.payload.firstName.trim().length > 1 ? data.payload.firstName : false;
            let lastName = typeof(data.payload.lastName) === "string" && data.payload.lastName.trim().length > 1 ? data.payload.lastName : false;
            let password = typeof(data.payload.password) === "string" && data.payload.password.trim().length >= 8 ? data.payload.password : false;
            if(firstName || lastName || password){
                _data.read("users", phone, (err, userData) => {
                    if(firstName){
                        userData.firstName = firstName;
                    }
                    if(lastName){
                        userData.lastName = lastName;
                    }
                    if(password){
                        userData.hashedPassword = helpers.hash(password);
                    }

                    _data.update("users", phone, userData, (err) => {
                        if(!err){
                            callbacks(200, {"message": "updated successfully"});
                        }else{
                            callbacks(500, {"Error": "Internal error in updating the requested data"})
                        }
                    })
                })
            }else{
                callbacks(400, {"Error": "At least one field is required to udpate"})
            }
        }else{
            callbacks(400, {"Error": "User don't exist with mentioned phone number !!!"})
        }

    },
    delete : (data, callback) => {
        // todo : Get the phone number to search user details
        // todo : only let authenticate user
        // todo : only its own data allowed to delete
        // todo : remove associated files also

        let phone = typeof(data.queryStringObject.phone) === 'string' && data.queryStringObject.phone.trim().length >= 10 ? data.queryStringObject.phone : false;
        if(phone){
            _data.read('users', phone, function(err, data){
                if(!err && data){
                    _data.delete("users", phone, (err) => {
                        if(!err){
                            callback(200, {"message": "Deleted successfully"})
                        }else{
                            callback(400, {"Error": "Could not delete"})
                        }
                    })
                }else{
                    callback(400, {"Error": "Couldn't find the related user with phone !!!"})
                }
            })
        }else{
            callback(400, {'Error' : 'Missing required fields '})
        }
    }
}

module.exports = userHandler;