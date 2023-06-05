import { IData } from "../interfaces/data";
import dataLibrary from "../lib/data";
import { verifyTokenId, verifyPhone } from "../utils/auth";

import { hashUserPassword, verifyPassword } from "../utils/hashPassword";
import { v4 as uuidv4 } from 'uuid';
import { AppError } from "./error.controller";

class Tokens {
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

  // ! Create new token
  // ? Required Data - phone, password
  async post(data: IData, callback) {
    let userInfo = JSON.parse(data.payload);
    let phone = verifyPhone(userInfo.phone);
    let password =
      typeof userInfo.password == "string" &&
      userInfo.password.trim().length > 6
        ? userInfo.password.trim()
        : false;

    if (phone && password) {
      try {
        
        let userData = await dataLibrary.read("users", phone);
        await verifyPassword(password, userData.password)
      
        // ! Create token and set expiration to 1 hour
          let tokenId = uuidv4();
          let expires = Date.now() + 1000 * 60 * 60;
          let tokenObject = {
            phone: phone,
            id: tokenId,
            expires: expires,
          };
          let tokenFileName = tokenId.slice(30);

        // ! Save the token into database and the token object
          await dataLibrary.create("tokens", tokenFileName, tokenObject);
          callback(200, { data: tokenObject });
          
      } catch (error: any) {
        if (error instanceof AppError) {
          callback(error.statusCode, { error: error.message });
        }
      }
    } else {
      callback(400, { message: "'Missing phone or password' 🎃" });
    }
  }

  // ? Required Data - token
  async get(data: IData, callback) {
    let token = verifyTokenId(data.queryStringObject.token as string);
    if (token) {
      try {
        // ! Read from database
        let tokenFileName = token.slice(30);
        let tokenObject = await dataLibrary.read("tokens", tokenFileName);
        callback(200, { data: tokenObject });
      } catch (error) {
        if (error instanceof AppError) {
          callback(error.statusCode, { error: error.message });
        }
      }
    } else {
      callback(400, { message: "Missing Required token number" });
    }
  }

  // ? Required Data = token, extends
  // ? Optional Data =  none
  async put(data: IData, callback) {
    let tokenObject = JSON.parse(data.payload);
    let token = verifyTokenId(tokenObject.token as string);
    let extend =
      typeof tokenObject.extend == "boolean" && tokenObject.extend == true
        ? true
        : false;
    

    if (token && extend) {
      try {
        let tokenFileName = token.slice(30);
        let tokenData = await dataLibrary.read("tokens", tokenFileName);
        // ! Check token already has not get expired
        if (tokenData.expires > Date.now()) {
          tokenData.expires = Date.now() + 1000 * 60 * 60;

          await dataLibrary.update("tokens", tokenFileName, tokenData);
          callback(200, { message: "Token extended successfully" });
        } else {
          callback(400, { error: "Token already expired" });
        }
      } catch (error) {
        if (error instanceof AppError) {
          callback(error.statusCode, { error: error.message });
        }
      }
    } else {
      callback(400, {
        error: "Missing token 😡😡 or Invalid fields",
      });
    }
  }

  // ? Required Data - id
  async delete(data: IData, callback) {
    let token = verifyTokenId(data.queryStringObject.id as string);
    if (token) {
      try {
        let tokenFileName = token.slice(30);
        let tokenInfo = await dataLibrary.read("tokens", tokenFileName);

        if (tokenInfo) {
          await dataLibrary.delete("tokens", tokenFileName);
          callback(200, { message: "Token deleted successfully 🎈😂" });
        }
      } catch (error) {
        if (error instanceof AppError) {
          callback(error.statusCode, { error: error.message });
        }
      }
    } else {
      callback(400, { Error: "Missing required field" });
    }
  }
}

let tokenController = new Tokens();

export { tokenController };
