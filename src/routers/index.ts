import {controllers, userController, tokenController, checkController} from "../controllers";


const router = {
    'api/v1/ping': controllers.ping,
    'api/v1/user': userController.assignHandler,
    'api/v1/token': tokenController.assignHandler,
    'api/v1/checks': checkController.assignHandler,
    'notfound': controllers.notFound
}



export default router;