const userHandler = require("./users_handlers");

module.exports = {
    user: function(data, callbacks) {
        const acceptableMethods = ["post", "get", "put", "delete"];
        if(acceptableMethods.indexOf(data.method) > -1){
            userHandler[data.method](data, callbacks)
        }else{
            callbacks(405);
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