import controllers from "../controllers";
import { userController } from "../controllers/users.controller";

const router = {
    'api/v1/ping': controllers.ping,
    'api/v1/user': userController.assignHandler,
    'notfound': controllers.notFound
}

let ab = 'sample';
console.log(router[ab])

export default router;