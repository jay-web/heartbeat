import path from "path";
import fs from "node:fs/promises";
import dataLibrary from "../lib/data";
import https from "node:https";
import http from "node:http";
import url from "url";
import { sendTwilioSms } from "../utils/helpers";

class Workers {

    private baseDir = path.join(__dirname, '/../database/');

    init = () => {
        // ! Execute all the checks immediately
        this.gatherAllChecks();
        
        // ! Call the loop, to execute checks later on also
        this.loop();
    }

    gatherAllChecks = async () => {
      
        // let checksNames: string[] = [];
        try {
            let checks = await fs.readdir(this.baseDir+'checks/');
            if(checks && checks.length > 0){
                  // ! Loop into checks array and gather all check data
                  for(let check in checks){
                    let data = await fs.readFile(check, 'utf-8');
                    let checkData = JSON.parse(data);
                    checkData.state = ['up', 'down'].indexOf(checkData.state) > -1 ? checkData.state : 'down';
                    checkData.lastChecked = checkData.lastChecked || false
                   
                    this.performCheck(checkData);
                  }
            }else{
                console.info("No checks are available to process ")
            }
        } catch (error) {
            console.error(`Error while gathering all checks ${error}`)
        }
    
    }

    // ! Timer to execute the process once per minute
    loop = () => {
        setInterval(() => {
            this.gatherAllChecks();
        }, 1000 * 5)
    }

    //! Make request on checks and pass the data or error to performCheckoutcome function
    performCheck = (checkData) => {
        // ! Prepare the initial check outcome
        let checkOutcome: {'error': boolean | {}, 'responseCode': boolean | number} = {
            'error': false,
            'responseCode': false
        };

        // ! Set outcome has not been sent yet
        let outcomeSent = false;

        // ! Parsed the url
        let parsedUrl = url.parse(`${checkData.protocol}://${checkData.url}`, true);
        let hostName = parsedUrl.hostname;
        let path = parsedUrl.path;

        // ! Construct the request
        let requestObject = {
            'protocol': checkData.protocol+':',
            'hostname': hostName,
            'method': checkData.method.toUpperCase(),
            'path': path,
            'timeout': checkData.timeoutSeconds * 1000
        };

        // ! Instantiate request
        let _moduleToUse = checkData.protocol == 'http' ? http : https;

        let req = _moduleToUse.request(requestObject, (res) => {
            let status = res.statusCode;
            if(status){
                checkOutcome.responseCode = status;
            }
            if(!outcomeSent){
                this.processCheckOutcome(checkData, checkOutcome);
                outcomeSent = true;
            }
            
        });

        //! Bind the req on error
        req.on('error', (e) => {
            checkOutcome.error = {
                'error': true,
                'value': e
            }
            if(!outcomeSent){
                this.processCheckOutcome(checkData, checkOutcome);
                outcomeSent = true;
            }
        });

        // ! Bind to the timeout
        req.on('timeout', (e) => {
            checkOutcome.error = {
                'error': true,
                'value': 'timeout'
            }
            if(!outcomeSent){
                this.processCheckOutcome(checkData, checkOutcome);
                outcomeSent = true;
            }
        });
        
        //! End the request
        req.end()
       
    }

    // ! Process the checkOutCome Data
    // ! Update the checkData
    // ! Trigger alarm on status change to DOWN

    processCheckOutcome = async (checkData, checkOutcomeData) => {
        // ! Find the check status i.e 'UP' or 'DOWN;
        let state = !checkOutcomeData.error && 
                        checkOutcomeData.responseCode && 
                        checkData.successCode.indexOf(checkOutcomeData.responseCode) > - 1
                        ? 'UP' : 'DOWN';

        // ! Decide alert need to be alarm or not
        let alertWarranted = checkData.lastChecked && checkData.state !== state ? true : false;

        // ! Update the check data as per updation on check process
        let newCheckData = {...checkData};
        newCheckData.state = state;
        newCheckData.lastChecked = Date.now();

        // ! Save the updated data into database
        let checkFileName = newCheckData.id.slice(30);

        try {
            await dataLibrary.update('checks', checkFileName, newCheckData);
            if(alertWarranted){
                this.triggerAlarm(newCheckData)
            }
        } catch (error) {
            console.error('Error while updating error on check')
        }
    }

    triggerAlarm = async (newCheckData) => {
        let message = `Alert : your check for 
                        ${newCheckData.method.toUpperCase()} for the 
                        ${newCheckData.protocol}://
                        ${newCheckData.url}
                        has been change to 
                        ${newCheckData.state}`;

        await sendTwilioSms(newCheckData.userPhone, message, (error) => {
            if(!error){
                console.log('Successfully alerted to the user ', message)
            }else{
                console.error('Error while alerting to user ', error)
            }
        })
                        
    }

}

let workers = new Workers();

export default workers;