import http, { IncomingMessage, ServerResponse } from "http";
import unifiedServer from "./unifiedServer";


// ! Instantiate HTTP Server
const httpServer = http.createServer(function (req: IncomingMessage,res: ServerResponse) {
    unifiedServer(req, res);
  });


export default httpServer;