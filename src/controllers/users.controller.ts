
import dataLibrary from "../lib/data";
import { verifyToken } from "../utils/auth";
import { hashUserPassword } from "../utils/hashPassword";
import { validateUserInput } from "../utils/validateUserForm";
import { IData } from "../interfaces/data";

class Users {
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

  // ! Create new user
  // ? Required Data - firstname, lastname, phone toaAgreement
  async post(data: IData, callback) {
    let userInfo = JSON.parse(data.payload);
    if (validateUserInput(userInfo)) {
      let { firstName, lastName, phone, tosArgreement } = userInfo;
      let password = hashUserPassword(userInfo.password);

      let userObject = {
        firstName,
        lastName,
        phone,
        password,
        tosArgreement,
      };
      try {
        await dataLibrary.create("users", phone, userObject);
        callback(200, { message: "User created successfully 🎃" });
      } catch (error: any) {
        // throw new Error(error);
        console.log({ error });
        callback(400, { "Error ": error.message });
      }
    } else {
      callback(400, { message: "'Missing required field' 🎃" });
    }
  }

  // ? Required Data - phone
  // ? Authorized only
  async get(data: IData, callback) {
    let userPhone = data.queryStringObject.phone as string;
    let token = data.headers.token;
    try {
      // !Verify token is valid or not
      let isAuthorized = await verifyToken(token, userPhone);

      if (isAuthorized) {
        // ! Read from database
        let data = await dataLibrary.read("users", userPhone);
        delete data.password;
        callback(200, { data: data });
      } else {
        callback(404, { Error: "User not found" });
       
      }
    } catch (error: any) {
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
          if(user.checks.length > 0){
            let noOfDeletedCheck = 0;
            user.checks.forEach(async (checkId) => {
              let fileName = checkId.slice(30);
              await dataLibrary.delete('checks', fileName);
              noOfDeletedCheck++;
            });
            if(noOfDeletedCheck == user.checks.length){
              callback(200, { message: "User deleted successfully 🎈😂" });
            }else{
              callback(500, { 'Error ': 'Internal server error while deleting checks of user'})
            }
          }
          
         
        }
      } catch (error) {
        callback(400, { Error: "Could not find the specified user" });
      }
    } else {
      callback(401, { Error: "Missing required field or not authorized" });
    }
  }
}

let userController = new Users();

export { userController };
