import { ParsedUrlQuery } from "node:querystring";
import dataLibrary from "../lib/data";
import { verifyToken } from "../utils/auth";
import { hashUserPassword } from "../utils/hashPassword";
import {
  validateCheckInput,
  validateUserInput,
} from "../utils/validateUserForm";

import { IData } from "../interfaces/data";
import { ICheck } from "../interfaces/checkData";
import config from ".././config.js";
import { v4 as uuidv4 } from "uuid";

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
  

  // ? Required Data = phone
  // ? Optional Data =  firstName, lastName, password ( at least one required)
  // ? Should be authorized
  async put(data: IData, callback) {
    let userPhone = data.queryStringObject.phone as string;
    let isAuthorized = await verifyToken(data.headers.token, userPhone);
    let user = JSON.parse(data.payload);

    if (isAuthorized) {
      let newFirstName =
        typeof user.firstName == "string" && user.firstName.trim().length > 0
          ? user.firstName.trim()
          : false;
      let newLastName =
        typeof user.lastName == "string" && user.lastName.trim().length > 0
          ? user.lastName.trim()
          : false;
      let newPassword =
        typeof user.password == "string" && user.password.trim().length > 6
          ? user.password.trim()
          : false;

      if (newFirstName || newLastName || newPassword) {
        try {
          let user = await dataLibrary.read("users", userPhone);
          if (newFirstName) {
            user = { ...user, firstName: newFirstName };
          }
          if (newLastName) {
            user = { ...user, lastName: newLastName };
          }
          if (newPassword) {
            user = { ...user, password: hashUserPassword(newPassword) };
          }

          await dataLibrary.update("userss", userPhone, user);
          callback(200, { message: "User updated successfully 🎃" });
        } catch (error: any) {
          console.log("type of ", error);
          callback(400, { Error: error.message });
        }
      } else {
        callback(400, {
          Error: "At least provide firstName, lastName or password to update",
        });
      }
    } else {
      callback(401, { Error: "Not authorized" });
    }
  }

  // ? Required Data - phone
  async delete(data: IData, callback) {
    let userPhone = data.queryStringObject.phone as string;
    let isAuthorized = await verifyToken(data.headers.token, userPhone);
    if (isAuthorized) {
      try {
        let user = await dataLibrary.read("users", userPhone);
        if (user) {
          await dataLibrary.delete("users", userPhone);
          callback(200, { message: "User deleted successfully 🎈😂" });
        }
      } catch (error) {
        callback(400, { Error: "Could not find the specified user" });
      }
    } else {
      callback(401, { Error: "Missing required field or not authorized" });
    }
  }
}

let checkController = new Checks();

export { checkController };
