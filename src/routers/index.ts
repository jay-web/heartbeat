import controllers from "../controllers";

const router = {
    'api/v1/foo': controllers.sample,
    'notfound': controllers.notFound
}

let ab = 'sample';
console.log(router[ab])

export default router;