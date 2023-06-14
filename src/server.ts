
import config from "./config";
import httpsServer from "./servers/httpsServer";
import httpServer from "./servers/httpServer";

import workers from "./workers";

const httpPort = config.httpPort;
const httpsPort = config.httpsPort;




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