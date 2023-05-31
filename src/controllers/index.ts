import { userController } from "./users.controller";
import { tokenController } from "./tokens.controller";
import { checkController } from "./checkController";
class Controllers {

    ping(data:any, callback:any){
        callback(200)
    }

    notFound(data:any, callback:any){
        callback(404)
    }
}

let controllers = new Controllers();

export { controllers, userController, tokenController, checkController };