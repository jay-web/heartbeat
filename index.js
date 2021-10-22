
const http = require("http");
const url = require("url");
const {StringDecoder} = require('string_decoder')

const router = require("./router.js");
const handlers = require("./handlers.js");

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

        // Choose the handler this request should go to : if not found go to notfound handler
        let selectedHandler = router[trimUrl] ? router[trimUrl] : handlers['notFound'];

        // combined the data to sent
        let data = {
            'queryStringObject': queryStringObject,
            'headers': headers,
            'method': method,
            'payload': buffer
        }

        // finally route the request to handler
        selectedHandler(data, function(statusCode, payload){
            statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

            payload = typeof(payload) == 'object' ? payload : {};

            // convert the payload into string
            let payloadString = JSON.stringify(payload);

            // return the response
            res.writeHead(statusCode);
            res.end(payloadString);

        
        })

    })


})

// Listen to server on port 

server.listen(3000, function() {
    console.log("Server listening at port 3000");
})