import { userController } from "./users.controller";
class Controllers {

    ping(data:any, callback:any){
        callback(200)
    }

    notFound(data:any, callback:any){
        callback(404)
    }
}

let controllers = new Controllers();

export { controllers, userController };