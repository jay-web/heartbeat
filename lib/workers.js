const path = require("path");
const https = require("https");
const http = require("http");
const fs = require("fs");
const url = require("url");

const _data = require("./data");
const helpers = require("./helpers");

const workers = {
    init : () => {
        this.gatherAllChecks();

        this.loop();
    },
    gatherAllChecks : () => {
        _data.list("checks", function(err, checks){
            if(!err && checks && checks.length > 0){
                checks.forEach((check) => {
                    _data.read("checks", check, function(err, originalCheckData){
                        if(!err && originalCheckData){
                            this.validateCheckData(originalCheckData);
                        }else{
                            console.log(`Couldn't read the data for the check ${check}`)
                        }
                    })
                })
            }else{
                console.log("Couldn't find any checks to process")
            }
        })
    },
    loop: () => {
        setInterval(() => {
            this.gatherAllChecks();
        }, 1000 * 60)
    },
    validateCheckData : (originalCheckData) => {
      originalCheckData = typeof(originalCheckData) == 'object' &&  originalCheckData !== null ? originalCheckData : {};
      originalCheckData.id = typeof(originalCheckData.id) == 'string' && originalCheckData.trim().length === 20 ? originalCheckData.id : false;
      originalCheckData.userPhone = typeof(originalCheckData.userPhone) == 'string' && originalCheckData.userPhone.trim().length == 10 ? originalCheckData.userPhone : false;
      originalCheckData.protocol = typeof(originalCheckData.protocol) === "string" && ["https", "http"].indexOf(originalCheckData.protocol) > -1 ? originalCheckData.protocol : false;
      originalCheckData.url = typeof(originalCheckData.url) === "string" && originalCheckData.url.trim().length > 0 ? originalCheckData.url : false;
      originalCheckData.method = typeof(originalCheckData.method) === "string" && ["get", "post", "put", "delete"].indexOf(originalCheckData.method) > -1 ? originalCheckData.method : false;
      originalCheckData.successCode = typeof(originalCheckData.successCode) === "object" && originalCheckData.successCode instanceof Array && originalCheckData.successCode.length > 0 ? originalCheckData.successCode : false;
      originalCheckData.timeoutSeconds = typeof(originalCheckData.timeoutSeconds) === "number" && originalCheckData.timeoutSeconds % 1 == 0 && originalCheckData.timeoutSeconds >= 1 && originalCheckData.timeoutSeconds <= 5 ? data.payload.timeoutSeconds : false;
    
        
      // TODO: Set the state and lastChecked key 
      originalCheckData.state = typeof(originalCheckData.state) == 'string' && ['up', 'down'].indexOf(originalCheckData.state) > -1 ? originalCheckData.state : 'down';
      originalCheckData.lastChecked = typeof(originalCheckData.lastChecked) == 'number' ? originalCheckData.lastChecked : false;
      
      // TODO: If all the checks are passed, pass the data to the next step in process
      if(originalCheckData.id && originalCheckData.userPhone && originalCheckData.protocol && originalCheckData.url && originalCheckData.method && originalCheckData.successCode && originalCheckData.timeoutSeconds){
        this.performCheck(originalCheckData);
      }else{
          console.log("One of the check is not formatted properly, skipping it")
      }

    },

    performCheck : (originalCheckData) => {
        // TODO : Prepare the initial check outcome
        let checkOutCome = {
            'error': false,
            'responseCode': false
        }

        let outcomeSent = false;

        // TODO: Parse the hostname and path out of the original checkdata
        let parsedUrl = url.parse(originalCheckData.protocol+'://'+originalCheckData.url, true);
        let hostname = parsedUrl.hostname;
        let path = parsedUrl.path;

        // TODO: Construct the request
        let requestDetails = {
            'protocol': originalCheckData.protocol+':',
            'hostname': hostname,
            'method': originalCheckData.method.toUpperCase(),
            'path': path,
            'timeout': originalCheckData.timeoutSeconds + 1000

        }

        let _moduleToUse = originalCheckData.protocol === 'http' ? http : https;
        
    }

}

module.exports = workers;