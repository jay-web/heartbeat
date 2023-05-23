import controllers from "../controllers";

const router = {
    'api/v1/ping': controllers.ping,
    'notfound': controllers.notFound
}

let ab = 'sample';
console.log(router[ab])

export default router;