
import config from "./config";
import httpsServer from "./servers/httpsServer";
import httpServer from "./servers/httpServer";
import dataLibrary from "./lib/data";
import workers from "./workers";

const httpPort = config.httpPort;
const httpsPort = config.httpsPort;


// dataLibrary.create('test', 'users', { name: 'jay'}, (err) => {
//   if(!err){
//     console.log(`Write successfully`)
//   }else{
//     console.log(err);
//   }
// })

// dataLibrary.read('test', 'users', (err, data) => {
//   if(data){
//     console.log(data)
//   }else{
//     console.log(err)
//   }
// } )


// dataLibrary.update('test', 'users', { name: 'jay'}, (err) => {
//   if(!err){
//     console.log('updated successfully')
//   }else{
//     console.error(err)
//   }
// })

// dataLibrary.delete('test', 'users', (err) => {
//   if(!err){
//     console.log('delete successfully')
//   }else{
//     console.error(err)
//   }
// })

// ! HTTPS AND HTTP Server listening at their respected PORTS

httpsServer.listen(httpsPort, () => {
  console.log(`Hey HTTPS server listening at ${httpsPort}`);
});



httpServer.listen(httpPort, () => {
  console.log(`Hey HTTP server listening at ${httpPort}`);
});

workers.init();


process.on('uncaughtException', (err) => {
  console.log(`Uncaught Exception: ${err.message}`);
  process.exit(1);
});


process.on('unhandledRejection', (reason, promise) => {
  console.log(`unhandled Rejection : `, promise, `reason : ${reason}`);
  process.exit(1)
})