
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

    if (validateCheckInput(checkPayload)) {
      let token =
        typeof data.headers.token == "string" ? data.headers.token : false;

      if (token) {
        let fileName = token.slice(30);
        try {
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
        } catch (error: any) {
          // throw new Error(error);
          console.log({ error });
          callback(400, { "Error ": error.message });
        }
      } else {
        callback(401, { "Error ": "Invalid token" });
      }
    } else {
      callback(400, { message: "'Missing required field' 🎃" });
    }
  }

  // ? Required Data - check id and token
  // ? Authorized only
  async get(data: IData, callback) {
    let checkId = data.queryStringObject.id as string;
    let token = data.headers.token;
    if (checkId) {
      // !Verify token is valid or not
      
        try {
          // ! Read from checkData using checkId
          let checkFileName = checkId.slice(30);
          let checkData = await dataLibrary.read("checks", checkFileName);
          // ! Check token is valid as per phone number saved in checkData
          let isAuthorized = await verifyToken(token, checkData.userPhone);
          if(isAuthorized){
            callback(200, { data: checkData });
          }else{
            callback(403)
          }
          
        } catch (error: any) {
          callback(404, { Error: error });
        }
      } 
      else {
        callback(401, {
          message: "Missing Required fields or Invalid token 😝😝",
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

    if (checkId) {
      

      if (validateCheckInputForUpdate(checkDataPayload)) {
        try {
          // ! Read from checkData using checkId
          let checkFileName = checkId.slice(30);
          let checkData = await dataLibrary.read("checks", checkFileName);
          // ! Check token is valid as per phone number saved in checkData
          let isAuthorized = await verifyToken(token, checkData.userPhone);
          if(isAuthorized){
            let updatedCheckData = updateCheckData(checkData, checkDataPayload);
            updatedCheckData.updated_at = new Date(); 
            await dataLibrary.update('checks', checkFileName, updatedCheckData);
            callback(200, { data: updatedCheckData });
          }else{
            callback(403)
          }
          
        } catch (error: any) {
          callback(404, { Error: error });
        }
      } else {
        callback(400, {
          Error: "At least provide one property of check Data to update",
        });
      }
    } else {
      callback(400, { Error: "Check id is missing" });
    }
  }

  // ? Required Data - checkId
  async delete(data: IData, callback) {
    let checkId = data.queryStringObject.id as string;
    let token = data.headers.token;
    if (checkId) {
      try {
        // ! Read from checkData using checkId
        let checkFileName = checkId.slice(30);
        let checkData = await dataLibrary.read("checks", checkFileName);
        // ! Check token is valid as per phone number saved in checkData
        let isAuthorized = await verifyToken(token, checkData.userPhone);
        if(isAuthorized){
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
        }else{
          callback(403)
        }
        
      } catch (error: any) {
        callback(404, { Error: error });
      }
    } else {
      callback(400, { Error: "Missing required checkId" });
    }
  }
}

let checkController = new Checks();

export { checkController };
