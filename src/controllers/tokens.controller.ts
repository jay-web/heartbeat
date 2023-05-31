import { IData } from "../interfaces/data";
import dataLibrary from "../lib/data";
import { verifyTokenId, verifyPhone } from "../utils/auth";
import { createRandomString } from "../utils/createRandomString";
import { hashUserPassword } from "../utils/hashPassword";
import { v4 as uuidv4 } from 'uuid';

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
        let hashPassword = hashUserPassword(password);
        if (hashPassword == userData.password) {
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
          try {
            await dataLibrary.create("tokens", tokenFileName, tokenObject);
            callback(200, { data: tokenObject });
          } catch (error) {
            callback(500, { Error: "Could not create the token 🥵🥵😰" });
          }
        } else {
          callback(400, { Error: "Wrong password 😡😡" });
        }
      } catch (error: any) {
        // throw new Error(error);
        console.log({ error });
        callback(400, { "Error ": error.message });
      }
    } else {
      callback(400, { message: "'Missing required field' 🎃" });
    }
  }

  // ? Required Data - token
  async get(data: IData, callback) {
    let token = verifyTokenId(data.queryStringObject.token as string);
    if (token) {
      try {
        // ! Read from database
        let tokenObject = await dataLibrary.read("tokens", token);
        callback(200, { data: tokenObject });
      } catch (error: any) {
        callback(404, { Error: "Token not found" });
      }
    } else {
      callback(400, { message: "Missing Required id number" });
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
    console.log("id and extend ", token, extend);

    if (token && extend) {
      try {
        let tokenData = await dataLibrary.read("tokens", token);
        // ! Check token already has not get expired
        if (tokenData.expires > Date.now()) {
          tokenData.expires = Date.now() + 1000 * 60 * 60;

          await dataLibrary.update("tokens", token, tokenData);
          callback(200, { message: "Token extended successfully" });
        } else {
          callback(400, { "Error ": "Token already expired" });
        }
      } catch (error) {
        callback(400, { "Error ": "specified token does not exist" });
      }
    } else {
      callback(400, {
        "Error ": "Missing Required fields 😡😡 or Invalid fields",
      });
    }
  }

  // ? Required Data - id
  async delete(data: IData, callback) {
    let token = verifyTokenId(data.queryStringObject.token as string);
    if (token) {
      try {
        let tokenInfo = await dataLibrary.read("tokens", token);

        if (tokenInfo) {
          await dataLibrary.delete("tokens", tokenInfo);
          callback(200, { message: "Token deleted successfully 🎈😂" });
        }
      } catch (error) {
        callback(400, { Error: "Could not find the specified token" });
      }
    } else {
      callback(400, { Error: "Missing required field" });
    }
  }
}

let tokenController = new Tokens();

export { tokenController };
