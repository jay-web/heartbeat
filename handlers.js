module.exports = {
    sample : function(data, callback){
        // callback a http status code and payload object
        console.log(data);
        callback(200, {name: "jay sharma"} )
    },

    notFound : function(data, callback){
        callback(404)
    }
}