// git remote add origin https://github.com/jay-web/monitoring.git
const http = require("http");
const url = require("url");
const {StringDecoder} = require('string_decoder')

// Create the server

const server = http.createServer((req, res) => {

    // get the url and parse it
    let parsedUrl = url.parse(req.url, true);

    // trim the pathname 
    let trimUrl = parsedUrl.pathname.replace(/^\/+|\/+$/g, '');

    // get the queryStringObject
    let queryStringObject = parsedUrl.query;

    // get the request method
    let method = req.method.toLowerCase();

    // get the headers as an object
    let headers = req.headers;

    // handle payload
    let decoder = new StringDecoder('utf-8');
    let buffer = '';
    req.on('data', function(data){
        buffer += decoder.write(data);
    });

    req.on('end', function(){
        buffer += decoder.end();

        
    console.log(trimUrl, method, queryStringObject, headers, buffer);
    res.end("Hello world !!!");

    })


})

// Listen to server on port 

server.listen(3000, function() {
    console.log("Server listening at port 3000");
})