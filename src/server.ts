
import config from "./config";
import httpsServer from "./servers/httpsServer";
import httpServer from "./servers/httpServer";

const httpPort = config.httpPort;
const httpsPort = config.httpsPort;

// ! HTTP AND HTTPS Server listening at their respected PORTS

httpsServer.listen(httpsPort, () => {
  console.log(`Hey server listening at ${httpsPort}`);
});



httpServer.listen(httpPort, () => {
  console.log(`Hey server listening at ${httpPort}`);
});
