import { IncomingMessage, ServerResponse } from "http";
import url from "url";
import { StringDecoder } from "string_decoder";
import router from "../routers";

const unifiedServer = function (req: IncomingMessage, res: ServerResponse) {
  if (req.url) {
    // ? Steps

    // ! 1: Get the url and parse it
    const parsedURL = url.parse(req.url, true);

    // ! 2: Get the path
    const path = parsedURL.pathname;
    const trimmedPath = path?.replace(/^\/+|\/+$/g, "");

    // ! 3: Get the query string as an Object
    const queryStringObject = parsedURL.query;

    // ! 4: Get the HTTP Method
    const method = req.method?.toLowerCase();

    // ! 5: Get the Headers
    const headers = req.headers;

    // ! 6: Get the payload if available or required
    const decorder = new StringDecoder("utf-8");
    let buffer = "";

    // ? This will only run if payload is available in request
    req.on("data", function (data) {
      buffer += data;
    });

    req.on("end", async function () {
      buffer += decorder.end();

      console.log("tm ", typeof trimmedPath, trimmedPath);

      // ? Choose the handler as per the path on which request need to send to handle
      if (trimmedPath) {
        let selectedHandler =
          router[trimmedPath] !== undefined
            ? router[trimmedPath]
            : router.notfound;

        console.log("sh ", typeof router[trimmedPath]);

        // ? Create data model to pass to the handler
        const data = {
          trimmedPath: trimmedPath,
          queryStringObject: queryStringObject,
          method: method,
          headers: headers,
          payload: buffer,
        };

        // console.log("Data from unifiedServer ", data)
        // ? finally call the handler
        try {
          selectedHandler(data, function (statusCode, payload) {
            // ! Set Default status code and payload if not provided to 200
            statusCode = typeof statusCode == "number" ? statusCode : 200;
            payload = typeof payload == "object" ? payload : {};

            // ! Convert the payload into JSON
            // ! (Note : this is payload which is respond by the server to user)
            let payloadString = JSON.stringify(payload);
            
            res.writeHead(statusCode);
            res.end(payloadString);
            console.log(`Request ends successfully `, payloadString, data)
          });
        } catch (error:any) {
          
            throw new Error(error.message)
        }
      }
    });
  }
};

export default unifiedServer;
