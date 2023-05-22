
class Controllers {

    sample(data:any, callback:any){
        callback(200, { 'name': 'handler sample'})
    }

    notFound(data:any, callback:any){
        callback(404)
    }
}

let controllers = new Controllers();

export default controllers;