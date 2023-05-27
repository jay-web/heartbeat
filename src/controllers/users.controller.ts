import { ParsedUrlQuery } from "node:querystring";
import dataLibrary from "../lib/data";
import { auth } from "../utils/auth";
import { hashUserPassword } from "../utils/hashPassword";
import { validateUser } from "../utils/validateUser";

interface IData {
    'trimmedPath': string,
    'queryStringObject': ParsedUrlQuery,
    'method': string,
    'headers': string,
    'payload': string
}

class Users {

    private methods: string[];

    constructor(){
         this.methods = ['get', 'post', 'put', 'patch', 'delete'];
    }
    

    private handlers = {
        'post': this.post,
        'get': this.get,
        'put': this.put,
        'delete': this.delete
    }

    assignHandler = (data:IData, callback) => {
        // console.log(`methods `, this.methods)
        if(this.methods.indexOf(data.method) > -1){
            this.handlers[data.method](data, callback)
        }else{
            callback(405, "Invalid HTTP Method")
        }
    }


    async post(data: IData, callback) {
        let userInfo = JSON.parse(data.payload);
        if (validateUser(userInfo)) {
           
            let { firstName, lastName, phone, tosArgreement } = userInfo;
            let password = hashUserPassword(userInfo.password);

            let userObject = {
                firstName,
                lastName,
                phone,
                password,
                tosArgreement
            }
            try {
            await dataLibrary.create('users', phone, userObject);   
            callback(200, { message: "User created successfully 🎃"})

            } catch (error:any) {
                // throw new Error(error);
                console.log({error})
                callback(400, {'Error ': error.message})
            } 


        } else {
            callback(400, { message: "'Missing required field' 🎃"})
        }
    }

    // ? Required Data - phone
    async get(data:IData, callback) {
        let userPhone = data.queryStringObject.phone?.toString();
        let phone = auth(userPhone);
        if(phone){
            try{
            // ! Read from database
                let data = await dataLibrary.read('users', phone);
                delete data.password;
                callback(200, {data: data})
            }catch(error:any){
                callback(404, { Error: "User not found"})
            }
            
        }else{
            callback(400, {message: "Missing Required phone number"})
        }
    }

    // ? Required Data = phone
    // ? Optional Data =  firstName, lastName, password ( at least one required)

    async put(data:IData, callback) {

        let userPhone = data.queryStringObject.phone?.toString();
        let phone = auth(userPhone);
        let user = JSON.parse(data.payload);
    
        if(phone){
            let newFirstName = typeof (user.firstName) == 'string' && user.firstName.trim().length > 0 ? user.firstName.trim() : false;
            let newLastName = typeof (user.lastName) == 'string' && user.lastName.trim().length > 0 ? user.lastName.trim() : false;
            let newPassword = typeof (user.password) == 'string' && user.password.trim().length > 6 ? user.password.trim() : false;

            if(newFirstName || newLastName || newPassword ){
                try {
                   let user =  await dataLibrary.read('users', phone);
                   if(newFirstName){
                    user = {...user, firstName:newFirstName}
                   }
                   if(newLastName){
                    user = {...user, lastName:newLastName}
                   }
                   if(newPassword){
                     user = {...user, password: hashUserPassword(newPassword)}
                   }
                   
                   try {
                    await dataLibrary.update('users', phone, user);
                    callback(200, { message: 'User updated successfully 🎃'})
                   } catch (error) {
                    callback(500, { Error: 'Could not update the user'})
                   }
                   
                } catch (error:any) {
                    callback(400, {Error: error.message})
                }
                
            }else{
                callback(400, { Error: "At least provide firstName, lastName or password to update"})
            }
        }else{
            callback(401, {Error: "Not authorized"})
        }

    }

    // ? Required Data - phone
    async delete(data:IData, callback) {
        let userPhone = data.queryStringObject.phone?.toString();
        let phone = auth(userPhone);
        if(phone){
            try {
                let user = await dataLibrary.read('users', phone);
                if(user){
                    await dataLibrary.delete('users', phone);
                    callback(200, { 'message': 'User deleted successfully 🎈😂'})
                }
                
            } catch (error) {
                callback(400, {'Error': 'Could not find the specified user'})
            }
        }else{
            callback(400, {  'Error': 'Missing required field'})
        }
    }



}

let userController = new Users();

export { userController}