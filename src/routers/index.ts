import {controllers, userController, tokenController} from "../controllers";


const router = {
    'api/v1/ping': controllers.ping,
    'api/v1/user': userController.assignHandler,
    'api/v1/token': tokenController.assignHandler,
    'notfound': controllers.notFound
}

let ab = 'sample';
console.log(router[ab])

export default router;