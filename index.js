
const https = require("https");
const http = require("http");
const url = require("url");
const {StringDecoder} = require('string_decoder')

const router = require("./router.js");
const handlers = require("./lib/handlers/handlers");
const config = require('./config.js');
const fs = require('fs');
const unifiedServer = require("./unifiedServer.js");

const httpsServerOptions = {
    'key': fs.readFileSync("./https/key.pem"),
    'cert': fs.readFileSync("./https/cert.pem")
}


// Initiate HTTPS server
const httpsServer = https.createServer(httpsServerOptions, (req, res) => {
    unifiedServer(req, res);
})

// Listen to server on httpsPort 
httpsServer.listen(config.httpsPort, function() {
    console.log("Server listening at port "+ config.httpsPort + " on " + config.envName + " mode");
})


// Initiate HTTP server
const httpServer = http.createServer((req, res) => {
    unifiedServer(req, res);
})

// Listen to server on httpPort
httpServer.listen(config.httpPort, function(){
    console.log("Server listening at port "+ config.httpPort + " on " + config.envName + " mode");
})