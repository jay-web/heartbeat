
import dataLibrary from "../lib/data";
import { verifyToken } from "../utils/auth";

import {
  validateCheckInput,
  validateCheckInputForUpdate
} from "../utils/validateUserForm";

import { IData } from "../interfaces/data";
import { ICheck } from "../interfaces/checkData";
import config from ".././config.js";
import { v4 as uuidv4 } from "uuid";
import { updateCheckData } from "../utils/helpers";
import { IUser } from "../interfaces/user";
import { AppError } from "./error.controller";

class Checks {
  private methods: string[];

  constructor() {
    this.methods = ["get", "post", "put", "patch", "delete"];
  }

  private handlers = {
    post: this.post,
    get: this.get,
    put: this.put,
    delete: this.delete,
  };

  assignHandler = (data: IData, callback) => {
    // console.log(`methods `, this.methods)
    if (this.methods.indexOf(data.method) > -1) {
      this.handlers[data.method](data, callback);
    } else {
      callback(405, "Invalid HTTP Method");
    }
  };

  // ! Create new check
  // ? Required Data - protocol, url, method, successCode, timeoutSeconds
  async post(data: IData, callback) {
    let checkPayload = <ICheck>JSON.parse(data.payload);

    try {
      await validateCheckInput(checkPayload);
      let token = typeof data.headers.token == "string" ? data.headers.token : false;

      if (token) {
        let fileName = token.slice(30);
       
          // ! Lookup the user by token
          let tokenData = await dataLibrary.read("tokens", fileName);
          let userPhone = tokenData.phone;
          let userData = await dataLibrary.read("users", userPhone);

          // ! Extract checks from userData and check its size
          let userChecks = userData.checks || [];
          if (userChecks.length < config.maxChecks) {
            let checkId = uuidv4();

            // ! Create the checkObject
            let checkObject = {
              id: checkId,
              userPhone: userPhone,
              protocol: checkPayload.protocol,
              url: checkPayload.url,
              method: checkPayload.method,
              successCode: checkPayload.successCode,
              timeoutSeconds: checkPayload.timeoutSeconds,
              created_at: Date.now()
            };

            let checkFileName = checkId.slice(30);

            // ! Save the object in check table
            await dataLibrary.create("checks", checkFileName, checkObject);
            // ! add the check Id to the user table
            userData.checks = userChecks;
            userData.checks.push(checkId);

            await dataLibrary.update("users", userPhone, userData);
            callback(200, { check: checkObject });
          } else {
            callback(400, {
              "Error ": "User has already maximum numbers of checks ",
            });
          }
        
      } else {
        callback(401, { "Error ": "Invalid token" });
      }
      
    } catch (error) {
      if (error instanceof AppError) {
        callback(error.statusCode, { error: error.message });
      }
    }


      

     
    
  }

  // ? Required Data - check id and token
  // ? Authorized only
  async get(data: IData, callback) {
    let checkId = data.queryStringObject.id as string;
    let token = data.headers.token;
    if (checkId && token) {
      // !Verify token is valid or not
      
        try {
          // ! Read from checkData using checkId
          let checkFileName = checkId.slice(30);
          let checkData = await dataLibrary.read("checks", checkFileName);
          // ! Check token is valid as per phone number saved in checkData (means data is belong to user)
          await verifyToken(token, checkData.userPhone);
          callback(200, { data: checkData });
          
        } catch (error: any) {
          if (error instanceof AppError) {
            callback(error.statusCode, { error: error.message });
          }
        }
      } 
      else {
        callback(401, {
          message: "Missing Required fields or missing token 😝😝",
        });
      }
    }
  

  // ? Required Data = checkId
  // ? Optional Data =  protocol, url, method, successCode, timeoutSeconds ( at least one required)
  // ? Should be authorized
  async put(data: IData, callback) {
    let checkId = data.queryStringObject.id as string;
    let token = data.headers.token;
    let checkDataPayload = JSON.parse(data.payload);

    if (checkId && token) {

      try {
        await validateCheckInputForUpdate(checkDataPayload);
        // ! Read from checkData using checkId
        let checkFileName = checkId.slice(30);
        let checkData = await dataLibrary.read("checks", checkFileName);
        // ! Check token is valid as per phone number saved in checkData
        await verifyToken(token, checkData.userPhone);
          let updatedCheckData = updateCheckData(checkData, checkDataPayload);
          updatedCheckData.updated_at = new Date(); 
          await dataLibrary.update('checks', checkFileName, updatedCheckData);
          callback(200, { data: updatedCheckData });
        
      } catch (error) {
        if (error instanceof AppError) {
          callback(error.statusCode, { error: error.message });
        }
      }
      

    } else {
      callback(400, { Error: "Check id or token is missing" });
    }
  }

  // ? Required Data - checkId
  async delete(data: IData, callback) {
    let checkId = data.queryStringObject.id as string;
    let token = data.headers.token;
    if (checkId && token) {
      try {
        // ! Read from checkData using checkId
        let checkFileName = checkId.slice(30);
        let checkData = await dataLibrary.read("checks", checkFileName);
        // ! Check token is valid as per phone number saved in checkData
        await verifyToken(token, checkData.userPhone);
        
          // ! Step one - delete check from check table
          await dataLibrary.delete('checks', checkFileName);

          // ! Step two = delete check data from user table
          let userInfo:IUser = await dataLibrary.read('users', checkData.userPhone);
          if(userInfo.checks){
            let indexOfCheck = userInfo.checks.indexOf(checkId);
            if(indexOfCheck > -1){
              userInfo.checks.splice(indexOfCheck, 1);
            }
            
          }
          // ! Save the updated user info into user table
          await dataLibrary.update('users', userInfo.phone, userInfo);
          callback(200, { message: 'check deleted successfully 😎' });
       
        
      } catch (error) {
        if (error instanceof AppError) {
          callback(error.statusCode, { error: error.message });
        }
      }
    } else {
      callback(400, { Error: "Missing required checkId or token" });
    }
  }
}

let checkController = new Checks();

export { checkController };
