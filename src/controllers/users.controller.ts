import dataLibrary from "../lib/data";
import { hashUserPassword } from "../utils/hashPassword";
import { IUser, validateUser } from "../utils/validateUser";

interface IData {
    'trimmedPath': string,
    'queryStringObject': string,
    'method': string,
    'headers': string,
    'payload': IUser
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
        'patch': this.patch,
        'delete': this.delete
    }

    assignHandler = (data, callback) => {
        // console.log(`methods `, this.methods)
        if(this.methods.indexOf(data.method) > -1){
            this.handlers[data.method](data, callback)
        }else{
            callback(405, "Invalid HTTP Method")
        }
    }


    async post(data: IData, callback) {

        if (validateUser(data.payload)) {
           
            let { firstName, lastName, phone, tosArgreement } = data.payload;
            let password = hashUserPassword(data.payload.password);

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

    get(callback) {

    }

    put(data: IUser, callback) {

    }

    patch(data: IUser, callback) {

    }

    delete(data: IUser, callback) {

    }



}

let userController = new Users();

export { userController}