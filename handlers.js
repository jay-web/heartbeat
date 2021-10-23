module.exports = {
    ping : function(data, callback){
        // callback a http status code and payload object
        callback(200);
    },

    notFound : function(data, callback){
        callback(404)
    }
}