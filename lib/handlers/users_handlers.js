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
                    if(err){
                        let hashedPassword = helpers.hash(password);
                        if(hashedPassword){
                            let userObject = {
                                'firstName': firstName,
                                'lastName' : lastName,
                                'phone': phone,
                                'password': hashedPassword,
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

    },
    put: (data, callbacks) => {

    },
    delete : (data, callbacks) => {

    }
}

module.exports = userHandler;