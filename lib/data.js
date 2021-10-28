const fs = require("fs");
const path = require('path');
const helpers = require("./helpers");
let baseDir = path.join(__dirname, '/../.data/');

module.exports = {
    // Create the file and saved the data into
    create:  (dir, file, data, callback) => {
        // first open the file
        fs.open(baseDir + dir +'/'+file+'.json', 'wx', function(err, fileDescriptor){
            
            if(!err && fileDescriptor){
                // convert data into string
                let dataIntoString = JSON.stringify(data);

                // write data to file and close it
                fs.writeFile(fileDescriptor, dataIntoString, function(err){
                    if(!err){
                        fs.close(fileDescriptor, function(err){
                            if(!err){
                                callback(false);
                            }else{
                                callback("Error in closing the file") 
                            }
                           
                        })
                    }else{
                        callback("Error in writing data to file")
                    }
                })
            }else{
                callback('Couldn"t create new file, it may already exist !!!')
            }
        })
    },

    read : (dir, file, callback) => {
        fs.readFile(baseDir + dir + "/" + file + ".json", "utf8", function(err, data) {
            if(!err && data){
                var parsedData = helpers.parsedJsonToObject(data);
                callback(false, parsedData)
            }else{
                callback(err, data);
            }
           
        })
    },

    update : (dir, file, data, callback) => {
        fs.open(baseDir + dir +"/" + file + ".json", 'r+', function(err, fileDescriptor){
            if(!err && fileDescriptor){
                // convert into string 
                let dataIntoString = JSON.stringify(data);

                // write or update the file
                fs.ftruncate(fileDescriptor, function(err) {
                    if(!err){
                        fs.writeFile(fileDescriptor, dataIntoString, function(err){
                            if(!err){
                                fs.close(fileDescriptor, function(err){
                                    if(!err){
                                        callback(false);
                                    }else{
                                        callback("Error closing the existing file")
                                    }
                                })
                            }else{
                                console.log('Error in updating the existing file');
                            }
                        })
                    }else{
                        console.log("Error in truncation !!!");
                    }
                })

            }else{
                callback("Could not open the file to update, may be don't exits");
            }
        })
    },

    delete: (dir, file, callback) => {
        fs.unlink(baseDir + dir + "/" + file + ".json", function(err){
            if(!err){
                callback(false);
            }else{
                callback("Error in deleting the file !!!")
            }
        })
    }
}