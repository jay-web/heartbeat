import https, { ServerOptions,  } from 'https';
import  { IncomingMessage, ServerResponse } from "http";
import fs from 'fs';
import path from 'path';
import unifiedServer from './unifiedServer';


const httpsServerOptions: ServerOptions = {
  key: fs.readFileSync(path.join(__dirname, '../https/key.pem')),
  cert: fs.readFileSync(path.join(__dirname, '../https/cert.pem'))
}

// ! Instantiate HTTPS Server
const httpsServer = https.createServer(httpsServerOptions, function (req: IncomingMessage,res: ServerResponse) {
  unifiedServer(req, res);
});



export default httpsServer;